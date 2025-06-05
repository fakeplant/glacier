import * as THREE from "three"
import JSON5 from "json5"

export interface FixtureComponent {
  type: string
  id?: string
  enabled?: boolean | string
  tag?: string
  tags?: string[]
  x?: number | string
  y?: number | string
  z?: number | string
  yaw?: number | string
  pitch?: number | string
  roll?: number | string
  scale?: number | string
  [key: string]: any
}

export interface FixtureTransform {
  enabled?: boolean | string
  x?: number | string
  y?: number | string
  z?: number | string
  yaw?: number | string
  pitch?: number | string
  roll?: number | string
  rotateX?: number | string
  rotateY?: number | string
  rotateZ?: number | string
  scaleX?: number | string
  scaleY?: number | string
  scaleZ?: number | string
  scale?:
    | { x?: number | string; y?: number | string; z?: number | string }
    | number
    | string
}

export interface FixtureDefinition {
  label?: string
  tags?: string[]
  parameters?: Record<string, any>
  transforms?: FixtureTransform[]
  components?: FixtureComponent[]
  meta?: Record<string, any>
  outputs?: any[]
  isVisible?: boolean
}

export interface OutputSegment {
  componentIndex?: number
  componentId?: string
  start?: number
  num?: number
  length?: number
  reverse?: boolean
  padPre?: number
  padPost?: number
}

export interface ParsedOutput {
  host: string
  protocol: string
  universe?: number
  channel?: number
  enabled: boolean
  sequenceEnabled?: boolean
  segments?: OutputSegment[]
  isChained: boolean // true if channel > 0
}

export interface Port {
  portNumber: number
  connectedFixtures: string[] // fixture IDs
  outputs: ParsedOutput[]
}

export interface Controller {
  id: string // IP address
  position: THREE.Vector3
  rotation: THREE.Euler
  ports: Map<number, Port> // port number -> Port
  maxPorts: number // 4 for TE, 8 for Mothership
}

export interface ParsedFixture {
  definition: FixtureDefinition
  id: string
  label: string
  tags: string[]
  points: THREE.Vector3[]
  bounds: THREE.Box3
  center: THREE.Vector3
  children: ParsedFixture[]
  meta?: Record<string, any>
  outputs: ParsedOutput[]
}

export class FixtureLoader {
  private fixtureCache = new Map<string, FixtureDefinition>()
  private loadedFixtures = new Map<string, ParsedFixture>()
  private controllers = new Map<string, Controller>() // IP -> Controller

  async loadFixture(path: string): Promise<FixtureDefinition> {
    if (this.fixtureCache.has(path)) {
      return this.fixtureCache.get(path)!
    }

    try {
      // Handle relative paths within TE fixture hierarchy
      let fixturePath = path
      if (!path.startsWith("TE/") && !path.startsWith("Mothership/")) {
        // For relative paths like "panel/PUA" or "edge/Edge9-12", prepend "TE/"
        fixturePath = `TE/${path}`
      }

      const response = await fetch(`fixtures/${fixturePath}.lxf`)
      const text = await response.text()

      // Parse JSON5 format directly
      const fixture = JSON5.parse(text) as FixtureDefinition

      this.fixtureCache.set(path, fixture)
      return fixture
    } catch (error) {
      console.error(`Failed to load fixture: ${path}`, error)
      throw error
    }
  }

  private evaluateExpression(
    expr: string | number,
    parameters: Record<string, any> = {}
  ): number {
    if (typeof expr === "number") return expr
    if (typeof expr !== "string") return 0

    // Simple parameter substitution
    let result = expr
    for (const [key, value] of Object.entries(parameters)) {
      const regex = new RegExp(`\\$${key}\\b`, "g")
      result = result.replace(regex, String(value))
    }

    try {
      // Basic math evaluation (be careful in production)
      return Function(`"use strict"; return (${result})`)()
    } catch {
      return 0
    }
  }

  async parseFixture(
    path: string,
    parameters: Record<string, any> = {},
    parentTransform: THREE.Matrix4 = new THREE.Matrix4()
  ): Promise<ParsedFixture> {
    const cacheKey = `${path}:${JSON.stringify(parameters)}`
    if (this.loadedFixtures.has(cacheKey)) {
      return this.loadedFixtures.get(cacheKey)!
    }

    const definition = await this.loadFixture(path)

    // Merge default parameters with provided ones
    const resolvedParams = {
      ...this.getDefaultParameters(definition),
      ...parameters,
    }

    const fixture: ParsedFixture = {
      definition,
      id: path,
      label: definition.label || path,
      tags: definition.tags || [],
      points: [],
      bounds: new THREE.Box3(),
      center: new THREE.Vector3(),
      children: [],
      meta: definition.meta,
      outputs: [],
    }

    // Apply transforms
    const transform = this.calculateTransforms(
      definition.transforms || [],
      resolvedParams
    )
    transform.premultiply(parentTransform)

    // Process components
    if (definition.components) {
      for (const component of definition.components) {
        if (!this.isComponentEnabled(component, resolvedParams)) continue

        await this.processComponent(
          component,
          resolvedParams,
          transform,
          fixture,
          path
        )
      }
    }

    // Calculate bounds and center
    if (fixture.points.length > 0) {
      fixture.bounds.setFromPoints(fixture.points)
      
      // Calculate geometric center of all points
      fixture.center.set(0, 0, 0)
      fixture.points.forEach(point => {
        fixture.center.add(point)
      })
      fixture.center.divideScalar(fixture.points.length)
    }

    // Process outputs and register controllers
    if (definition.outputs) {
      fixture.outputs = this.processOutputs(definition.outputs, resolvedParams, fixture)
      this.registerControllers(fixture)
    }

    this.loadedFixtures.set(cacheKey, fixture)
    return fixture
  }

  private getDefaultParameters(
    definition: FixtureDefinition
  ): Record<string, any> {
    const defaults: Record<string, any> = {}
    if (definition.parameters) {
      for (const [key, param] of Object.entries(definition.parameters)) {
        if (param && typeof param === "object" && "default" in param) {
          defaults[key] = param.default
        }
      }
    }
    return defaults
  }

  private calculateTransforms(
    transforms: FixtureTransform[],
    parameters: Record<string, any>
  ): THREE.Matrix4 {
    const matrix = new THREE.Matrix4()

    for (const transform of transforms) {
      if (!this.isTransformEnabled(transform, parameters)) continue

      const tempMatrix = new THREE.Matrix4()

      // Translation
      if (
        transform.x !== undefined ||
        transform.y !== undefined ||
        transform.z !== undefined
      ) {
        const x = this.evaluateExpression(transform.x || 0, parameters)
        const y = this.evaluateExpression(transform.y || 0, parameters)
        const z = this.evaluateExpression(transform.z || 0, parameters)
        tempMatrix.makeTranslation(x, y, z)
        matrix.multiply(tempMatrix)
      }

      // Rotations (in degrees, convert to radians)
      if (transform.yaw !== undefined) {
        const yaw =
          (this.evaluateExpression(transform.yaw, parameters) * Math.PI) / 180
        tempMatrix.makeRotationY(yaw)
        matrix.multiply(tempMatrix)
      }

      if (transform.pitch !== undefined) {
        const pitch =
          (this.evaluateExpression(transform.pitch, parameters) * Math.PI) / 180
        tempMatrix.makeRotationX(pitch)
        matrix.multiply(tempMatrix)
      }

      if (transform.roll !== undefined) {
        const roll =
          (this.evaluateExpression(transform.roll, parameters) * Math.PI) / 180
        tempMatrix.makeRotationZ(roll)
        matrix.multiply(tempMatrix)
      }

      // Individual axis rotations
      if (transform.rotateX !== undefined) {
        const rotX =
          (this.evaluateExpression(transform.rotateX, parameters) * Math.PI) /
          180
        tempMatrix.makeRotationX(rotX)
        matrix.multiply(tempMatrix)
      }

      if (transform.rotateY !== undefined) {
        const rotY =
          (this.evaluateExpression(transform.rotateY, parameters) * Math.PI) /
          180
        tempMatrix.makeRotationY(rotY)
        matrix.multiply(tempMatrix)
      }

      if (transform.rotateZ !== undefined) {
        const rotZ =
          (this.evaluateExpression(transform.rotateZ, parameters) * Math.PI) /
          180
        tempMatrix.makeRotationZ(rotZ)
        matrix.multiply(tempMatrix)
      }

      // Scaling
      if (transform.scale !== undefined) {
        let sx = 1,
          sy = 1,
          sz = 1
        if (typeof transform.scale === "object") {
          sx = this.evaluateExpression(transform.scale.x || 1, parameters)
          sy = this.evaluateExpression(transform.scale.y || 1, parameters)
          sz = this.evaluateExpression(transform.scale.z || 1, parameters)
        } else {
          const scale = this.evaluateExpression(transform.scale, parameters)
          sx = sy = sz = scale
        }
        tempMatrix.makeScale(sx, sy, sz)
        matrix.multiply(tempMatrix)
      }

      if (
        transform.scaleX !== undefined ||
        transform.scaleY !== undefined ||
        transform.scaleZ !== undefined
      ) {
        const sx = this.evaluateExpression(transform.scaleX || 1, parameters)
        const sy = this.evaluateExpression(transform.scaleY || 1, parameters)
        const sz = this.evaluateExpression(transform.scaleZ || 1, parameters)
        tempMatrix.makeScale(sx, sy, sz)
        matrix.multiply(tempMatrix)
      }
    }

    return matrix
  }

  private isTransformEnabled(
    transform: FixtureTransform,
    parameters: Record<string, any>
  ): boolean {
    if (transform.enabled === undefined) return true
    if (typeof transform.enabled === "boolean") return transform.enabled
    return this.evaluateExpression(transform.enabled, parameters) !== 0
  }

  private isComponentEnabled(
    component: FixtureComponent,
    parameters: Record<string, any>
  ): boolean {
    if (component.enabled === undefined) return true
    if (typeof component.enabled === "boolean") return component.enabled
    return this.evaluateExpression(component.enabled, parameters) !== 0
  }

  private async processComponent(
    component: FixtureComponent,
    parameters: Record<string, any>,
    parentTransform: THREE.Matrix4,
    fixture: ParsedFixture,
    currentPath: string
  ) {
    const componentTransform = this.calculateComponentTransform(
      component,
      parameters
    )
    componentTransform.premultiply(parentTransform)

    // Handle different component types
    switch (component.type) {
      case "point":
        this.processPoint(component, componentTransform, fixture)
        break

      case "points":
        this.processPoints(component, componentTransform, fixture)
        break

      case "strip":
        this.processStrip(component, parameters, componentTransform, fixture)
        break

      case "arc":
        this.processArc(component, parameters, componentTransform, fixture)
        break

      default:
        // Nested fixture reference
        await this.processNestedFixture(
          component,
          parameters,
          componentTransform,
          fixture,
          currentPath
        )
        break
    }
  }

  private calculateComponentTransform(
    component: FixtureComponent,
    parameters: Record<string, any>
  ): THREE.Matrix4 {
    const matrix = new THREE.Matrix4()

    // Translation
    const x = this.evaluateExpression(component.x || 0, parameters)
    const y = this.evaluateExpression(component.y || 0, parameters)
    const z = this.evaluateExpression(component.z || 0, parameters)
    matrix.makeTranslation(x, y, z)

    // Rotations
    const tempMatrix = new THREE.Matrix4()

    if (component.yaw !== undefined) {
      const yaw =
        (this.evaluateExpression(component.yaw, parameters) * Math.PI) / 180
      tempMatrix.makeRotationY(yaw)
      matrix.multiply(tempMatrix)
    }

    if (component.pitch !== undefined) {
      const pitch =
        (this.evaluateExpression(component.pitch, parameters) * Math.PI) / 180
      tempMatrix.makeRotationX(pitch)
      matrix.multiply(tempMatrix)
    }

    if (component.roll !== undefined) {
      const roll =
        (this.evaluateExpression(component.roll, parameters) * Math.PI) / 180
      tempMatrix.makeRotationZ(roll)
      matrix.multiply(tempMatrix)
    }

    // Scale
    if (component.scale !== undefined) {
      const scale = this.evaluateExpression(component.scale, parameters)
      tempMatrix.makeScale(scale, scale, scale)
      matrix.multiply(tempMatrix)
    }

    return matrix
  }

  private processPoint(
    _component: FixtureComponent,
    transform: THREE.Matrix4,
    fixture: ParsedFixture
  ) {
    const point = new THREE.Vector3(0, 0, 0)
    point.applyMatrix4(transform)
    // Flip Z coordinate to match Three.js coordinate system
    point.z = -point.z
    fixture.points.push(point)
  }

  private processPoints(
    component: FixtureComponent,
    transform: THREE.Matrix4,
    fixture: ParsedFixture
  ) {
    if (component.coords && Array.isArray(component.coords)) {
      for (const coord of component.coords) {
        const point = new THREE.Vector3(
          coord.x || 0,
          coord.y || 0,
          coord.z || 0
        )
        point.applyMatrix4(transform)
        // Flip Z coordinate to match Three.js coordinate system
        point.z = -point.z
        fixture.points.push(point)
      }
    }
  }

  private processStrip(
    component: FixtureComponent,
    parameters: Record<string, any>,
    transform: THREE.Matrix4,
    fixture: ParsedFixture
  ) {
    const numPoints = this.evaluateExpression(
      component.numPoints || 1,
      parameters
    )
    const spacing = this.evaluateExpression(component.spacing || 1, parameters)
    const reverse =
      this.evaluateExpression(component.reverse || 0, parameters) !== 0

    const points: THREE.Vector3[] = []

    for (let i = 0; i < numPoints; i++) {
      const index = reverse ? numPoints - 1 - i : i
      const point = new THREE.Vector3(index * spacing, 0, 0)
      point.applyMatrix4(transform)
      // Flip Z coordinate to match Three.js coordinate system
      point.z = -point.z
      points.push(point)
    }

    fixture.points.push(...points)
  }

  private processArc(
    component: FixtureComponent,
    parameters: Record<string, any>,
    transform: THREE.Matrix4,
    fixture: ParsedFixture
  ) {
    const numPoints = this.evaluateExpression(
      component.numPoints || 1,
      parameters
    )
    const radius = this.evaluateExpression(component.radius || 1, parameters)
    const degrees = this.evaluateExpression(
      component.degrees || 360,
      parameters
    )

    const angleStep = (degrees * Math.PI) / 180 / (numPoints - 1)

    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep
      const point = new THREE.Vector3(
        radius * Math.cos(angle),
        0,
        radius * Math.sin(angle)
      )
      point.applyMatrix4(transform)
      // Flip Z coordinate to match Three.js coordinate system
      point.z = -point.z
      fixture.points.push(point)
    }
  }

  private async processNestedFixture(
    component: FixtureComponent,
    parameters: Record<string, any>,
    transform: THREE.Matrix4,
    fixture: ParsedFixture,
    currentPath: string
  ) {
    try {
      // Extract child parameters
      const childParams = { ...parameters }
      for (const [key, value] of Object.entries(component)) {
        if (
          !["type", "x", "y", "z", "yaw", "pitch", "roll", "scale"].includes(
            key
          )
        ) {
          childParams[key] = value
        }
      }

      // Resolve relative paths
      let childPath = component.type
      if (
        !childPath.includes("/") ||
        (!childPath.startsWith("TE/") && !childPath.startsWith("Mothership/"))
      ) {
        // If it's a simple name like "panelRow" or relative path, resolve relative to current path
        const pathParts = currentPath.split("/")
        pathParts.pop() // Remove the filename part
        if (childPath.includes("/")) {
          // It's already a relative path like "panel/PUA"
          childPath = pathParts.join("/") + "/" + childPath
        } else {
          // It's just a filename like "panelRow"
          childPath = pathParts.join("/") + "/" + childPath
        }
      }

      const childFixture = await this.parseFixture(
        childPath,
        childParams,
        transform
      )
      fixture.children.push(childFixture)
      fixture.points.push(...childFixture.points)
    } catch (error) {
      console.warn(`Failed to load nested fixture: ${component.type}`, error)
    }
  }

  // Get top-level fixtures for menu display
  getTopLevelFixtures(
    fixtures: ParsedFixture[]
  ): Array<{ label: string; tags: string[]; fixture: ParsedFixture }> {
    const topLevel: Array<{
      label: string
      tags: string[]
      fixture: ParsedFixture
    }> = []

    for (const fixture of fixtures) {
      if (fixture.definition.components) {
        for (const component of fixture.definition.components) {
          if (component.type.includes("/")) {
            const [category] = component.type.split("/")
            const existing = topLevel.find((item) => item.label === category)
            if (!existing) {
              topLevel.push({
                label: category,
                tags: [category],
                fixture: fixture,
              })
            }
          }
        }
      }
    }

    return topLevel
  }

  // Filter fixtures by tags - includes fixtures if they or any descendants have matching tags
  filterByTags(fixtures: ParsedFixture[], tags: string[]): ParsedFixture[] {
    if (tags.length === 0) return fixtures

    const hasMatchingTags = (fixture: ParsedFixture): boolean => {
      // Check if this fixture has matching tags
      if (tags.some((tag) => fixture.tags.includes(tag))) {
        return true
      }
      
      // Check if any children have matching tags
      return fixture.children.some((child) => hasMatchingTags(child))
    }

    return fixtures.filter(hasMatchingTags)
  }

  // Get all unique tags from fixtures
  getAllTags(fixtures: ParsedFixture[]): string[] {
    const tags = new Set<string>()

    const addTags = (fixture: ParsedFixture) => {
      fixture.tags.forEach((tag) => tags.add(tag))
      fixture.children.forEach(addTags)
    }

    fixtures.forEach(addTags)
    return Array.from(tags).sort()
  }

  private processOutputs(
    outputs: any[],
    parameters: Record<string, any>,
    fixture: ParsedFixture
  ): ParsedOutput[] {
    return outputs.map((output) => {
      // Resolve parameter substitutions
      const host = this.evaluateStringExpression(output.host || "", parameters)
      const universe = output.universe ? this.evaluateExpression(output.universe, parameters) : undefined
      const channel = output.channel ? this.evaluateExpression(output.channel, parameters) : 0
      const enabled = output.enabled !== undefined ? 
        (typeof output.enabled === "boolean" ? output.enabled : this.evaluateExpression(output.enabled, parameters) !== 0) : 
        true
      const sequenceEnabled = output.sequenceEnabled !== undefined ? 
        (typeof output.sequenceEnabled === "boolean" ? output.sequenceEnabled : this.evaluateExpression(output.sequenceEnabled, parameters) !== 0) : 
        false

      const parsedOutput: ParsedOutput = {
        host,
        protocol: output.protocol || "artnet",
        universe,
        channel,
        enabled,
        sequenceEnabled,
        segments: output.segments || [],
        isChained: channel > 0,
      }

      return parsedOutput
    }).filter(output => output.enabled)
  }

  private evaluateStringExpression(
    expr: string,
    parameters: Record<string, any> = {}
  ): string {
    if (!expr) return ""
    
    let result = expr
    for (const [key, value] of Object.entries(parameters)) {
      const regex = new RegExp(`\\$${key}\\b`, "g")
      result = result.replace(regex, String(value))
    }
    
    return result
  }

  private registerControllers(fixture: ParsedFixture) {
    for (const output of fixture.outputs) {
      if (!output.host) continue

      // Determine max ports based on fixture type
      const isTE = fixture.id.startsWith("TE/")
      const maxPorts = isTE ? 4 : 8

      // Get or create controller
      let controller = this.controllers.get(output.host)
      if (!controller) {
        controller = {
          id: output.host,
          position: new THREE.Vector3(),
          rotation: new THREE.Euler(),
          ports: new Map(),
          maxPorts,
        }
        this.controllers.set(output.host, controller)
      }

      // Extract port number from output
      const portNumber = this.extractPortNumber(output, fixture)
      if (portNumber > 0 && portNumber <= maxPorts) {
        // Get or create port
        let port = controller.ports.get(portNumber)
        if (!port) {
          port = {
            portNumber,
            connectedFixtures: [],
            outputs: [],
          }
          controller.ports.set(portNumber, port)
        }

        // Add fixture and output to port
        if (!port.connectedFixtures.includes(fixture.id)) {
          port.connectedFixtures.push(fixture.id)
        }
        port.outputs.push(output)
      }
    }
  }

  private extractPortNumber(output: ParsedOutput, fixture: ParsedFixture): number {
    // For TE fixtures, extract from universe calculation
    // universe is typically calculated as "$outputNumber*10" 
    if (output.universe) {
      const portNumber = Math.floor(output.universe / 10)
      return portNumber
    }
    
    // Fallback: try to extract from parameters
    const definition = fixture.definition
    if (definition.parameters) {
      for (const [key, param] of Object.entries(definition.parameters)) {
        if (key.includes("output") && param && typeof param === "object" && "default" in param) {
          return Number(param.default) || 1
        }
      }
    }
    
    return 1 // Default to port 1
  }

  // Get all controllers
  getControllers(): Controller[] {
    this.updateControllerPositions()
    return Array.from(this.controllers.values())
  }

  private updateControllerPositions() {
    for (const controller of this.controllers.values()) {
      // Calculate position as center of all connected fixtures
      const connectedFixtures: ParsedFixture[] = []
      
      for (const port of controller.ports.values()) {
        for (const fixtureId of port.connectedFixtures) {
          // Find fixture by ID in loaded fixtures
          for (const [, fixture] of this.loadedFixtures) {
            if (fixture.id === fixtureId) {
              connectedFixtures.push(fixture)
              break
            }
          }
        }
      }

      if (connectedFixtures.length > 0) {
        controller.position.set(0, 0, 0)
        connectedFixtures.forEach(fixture => {
          controller.position.add(fixture.center)
        })
        controller.position.divideScalar(connectedFixtures.length)
        
        // Offset controller position slightly to avoid overlapping with fixtures
        controller.position.y += 20 // Move 20 units above
      }
    }
  }
}

export const fixtureLoader = new FixtureLoader()
