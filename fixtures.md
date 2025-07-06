Custom Fixtures
Custom fixtures are defined in a JSON-formatted file with the .lxf suffix. Fixture definitions are placed in the ~/Chromatik/Fixtures folder. These fixtures are visible in the Fixture Chooser from the FIXTURES section on the left-pane MODEL tab, arranged by subdirectory name.


File Structure
The custom fixture file contains a top-level JSON dictionary with definitions of all the fixture's properties. A fixture defines a set of points as one or more components, which are either geometric primitives or references to other fixture definitions. Fixtures may be nested hierarchically to create complex structures. Parameter substitutions allow for dynamic configuration of fixture properties by the user.


{
  "label": "Custom",

  "tags": [ "custom", "another" ],

  "transforms": {
    /* See Transforms */
  },

  "parameters": {
    /* See Parameters */
  },

  "components": [
    /* See Components */
  ],

  "outputs": [
    /* See Outputs */
  ],

  "meta": {
    "key1": "FirstData",
    "key2": "9834"
  }
}
Core Fields
label: optional string field supplies a default label that is displayed for any new instantiation of this fixture type
tag / tags: optional string tag or array of tags that can be used to query this type of fixture in the LXModel hierarchy, tags may only contain the characters A-Za-z0-9_.-/
isVisible: optional boolean default true, specifying whether this fixture is visible in the Fixture Chooser, specify false to suppress display of helper sub-fixtures that are not intended for direct instantiation
Parameters
"parameters": {
  "numPoints": {
    "type": "int",
    "default": 10,
    "min": 10,
    "max": 100,
    "label": "Num Things",
    "description": "Example integer parameter"
  },
  "spacing": {
    "type": "float",
    "default": 0.5,
    "label": "Spacing",
    "description": "Example float parameter"
  },
  "hostname": {
    "type": "string",
    "default": "127.0.0.1",
    "label": "Hostname",
    "description": "Example string parameter holding a hostname"
  },
  "boolParam": {
    "type": "boolean",
    "default": false,
    "label": "Bool Param",
    "description": "Example boolean parameter"
  }
}
Under the optional parameters field, variables can be defined. The parameters field must hold a dictionary. The keys are the names of parameters which can be later substituted. The UI automatically display controls to set the values of these parameters, and their values can be used in variable substitutions for other values in the JSON file, or a child JSON file.

type: required, one of int, float, boolean, string
default: required, a default value for the parameter, must be of correct type
label: optional, a human-readable label for the parameter in the UI (if not supplied, the JSON key is used)
description: optional, a description of the functionality of this parameter that the UI shows on hover
min: optional, minimum value for numeric parameters only
max: optional, maximum value for numeric parameters only
Substitutions
"output": {
  "protocol": "artnet",
  "host": "$hostname",
  "num": "$numPoints",
  ...
}
The keys in this JSON dictionary can be referenced using the syntax "$varKey", where varKey is the string key for this parameter in the JSON dictionary. The substitution must appear inside a quote-encapsulated JSON string. Keys must only be alphanumeric. The example above shows parameters being used to specify output settings.

Basic mathematical operators +, -, *, /, %, ^ are available to form simple expressions for integer and floating point values, alongside single-argument functions sin, cos, tan, asin, acos, atan, deg, rad, abs, sqrt. The trigonometric functions take arguments and return values specified in degrees.

In the case of boolean expressions, single-character operators &, |, ! are used for logical AND, OR, NOT.

The following example shows boolean and mathematical expressions being used to specify whether a component is present and its size, based upon variables $hasStrip, $size, and $pointsPerEdge.

"components": [
  {
    "type": "strip",
    "enabled": "$hasStrip",
    "x": "0.5 * $size / $pointsPerEdge",
    ...
UX Interaction
Parameters of custom fixtures are shown in the INSPECTOR section. These can be modified in real-time. Note that parameter modification that changes the geometry or output structure will necessarily trigger regeneration of the entire model. Therefore, it is never recommended to use fixture parameters as a real-time animation tool. These parameters may not be modulated or mapped to MIDI controllers.

The Fixture Path field indicates the file being used and the Reload  button may be used during fixture development if the .lxf file has been modified on disk. If a file contains invalid syntax, errors messages are displayed here.


Components
Components of the custom fixture are enumerated in a JSON array under the components key. Each component element is a JSON dictionary which indicates its type in the type field.

{
  "type": "<type>",
  "id": "uniqueId",
  "tag": "customTag",
  "x": 4,
  "y": 7,
  "z": 11,
  "yaw": 45,
  "pitch": 15,
  "roll": -10,
  "output": {
    /* see Outputs */
  },
  "meta": {
    "key": "value"
  }
}
type: Type of the component
id: Optional unique identifier (see Referencing)
enabled: Optional boolean, if false the component is skipped
tag / tags: Optional string identifier tags
x: Float X-coordinate of the component
y: Float Y-coordinate of the component
z: Float Z-coordinate of the component
yaw: Optional rotation about the +Y vertical axis in degrees
pitch: Optional rotation about the +X horizontal axis in degrees
roll: Optional rotation about the +Z depth axis in degrees
scale: Optional scaling of the compomnent's geometry
output / outputs: Optional outputs (see Outputs)
meta: Optional metadata (See Metadata)
Point (point)
{
  "type": "point",
  "x": 14,
  "y": 15,
  "z": 16
}
A component of type point is an individual point specified as a JSON dictionary with geometry coordinates. Creation of a large number of single points is not recommended. Use the points type for collections of points whenever possible.

Points (points)
{
  "type": "points",
  "coords": [
    { "x": 1, "y": 2, "z": 3 },
    { "x": 4, "y": 5, "z": 6 },
    { "x": 7, "y": 8, "z": 9 }
  ]
}
A component of type points holds an array of individual points. Coordinates are stored in the coords fields, an array of dictionaries specifying:

Strip (strip)
{
  "type": "strip",
  "x": 0,
  "y": 0,
  "z": 0,
  "numPoints": 50,
  "spacing": 10
}
A component of type strip specifies a linear run of points with fixed spacing. The reference position specifies the location of the first point.

numPoints: Integer number of points in the strip
spacing: Float spacing between points in the strip
The orientation of the strip is specified using the yaw, pitch, and roll parameters. Alternatively, if these are omitted a direction vector may be provided.

"direction": {
  "x": 1,
  "y": 1,
  "z": 0
}
A second alternative is to specify an end vector, which specifies the location of the final point in the strip. Rotation and spacing are inferred.

"end": {
  "x": 1,
  "y": 1,
  "z": 0
}
Arc (arc)
{
  "type": "arc",
  "mode": "center",
  "radius": 100,
  "numPoints": 50,
  "degrees": 45
}
A component of type arc is a curved run of points with fixed circular radius.

mode: One of center or origin which specifies whether the given position is the center of the arc, or its first point
radius: Radius of the arc
numPoints: Integer number of points in the arc
degrees: Float number of degrees the arc rotates around
The orientation of the arc is specified using the yaw, pitch, and roll parameters. Alternatively, if these are omitted either a normal or direction vector may be supplied.

The normal vector specifies a normal vector around which the arc rotates.

"normal": {
  "x": 0,
  "y": 0,
  "z": 1
}
The direction vector specifies the direction of a line tangent to the arc's starting point.

"direction": {
  "x": 1,
  "y": 0,
  "z": 0
}
Native (class)
{
  "type": "class",
  "class": "com.yourpackage.NativeFixture"
  "x": 10,
  "yaw": "90",
  "parameters": {
    "param1": 40,
    "param2": 80
  } 
}
A component of type class references a native fixture type via its fully qualified Java class name in the class field. The specified class must inherit from LXFixture and provide a public constructor. Parameters are explicitly enumerated in the JSON dictionary parameters.

Nested Fixtures
{
  "type": "Child",
  "childParam": "$paramValue",
  "x": 10,
  "yaw": "90"  
},
{ 
  "type": "Subdir/Child",
  "scale": 2
}
A custom fixture may contain and reference other custom fixtures as components.

type: string which refers to the name of the child .lxf file
e.g. Child would be used to reference Fixtures/Child.lxf
e.g. Subdir/NestedChild would be used to reference Fixtures/Subdir/NestedChild.lxf
If the child fixture defines any custom parameters, those values may be specified directly on the child JSON dictionary, as seen with childParam above.

If a fixture already exists in a subdirectory, it is not required to repeat the subdirectory name as a prefix in nested component type specifications.

Instancing
Complex visual arrangements can often be created by repeating instances of a simpler geometric form. Any component may be instanced by providing the key instances with an integer value specifying the number of instances. A variable $instance is made available for substiutions based upon the instance number (0-indexed).

The following example would create a series of 10 horizontal strips with increasing y-position and length at a spacing of 20.

{
  "type": "strip",
  "instances": 10,
  "numPoints": "30 + $instance * 10",
  "spacing": 10,
  "y": "$instance * 20"
}
Transforms
The overall geometry of a fixture can be modified at the top level using an arbitrary series of geometric transforms. This can be useful when the default fixed-order operation of translation followed by yaw/pitch/roll is not preferred.

Transforms are specified as a JSON array of objects on the transforms key. Transforms are applied in the order specified. Translation, scaling, and rotation may not be combined in a single transform. Rotations specify one axis at a time. Rotation angles are given in degrees.

All valid transform keys are indicated below.

enabled: Whether the transformation is applied
x: X translation
y: Y translation
z: Z translation
yaw: Yaw rotation in degrees
pitch: Pitch rotation in degrees
roll: Roll rotation in degrees
rotateX: Rotate about +X in degrees
rotateY: Rotate about +Y in degrees
rotateZ: Rotate about +Z in degrees
scaleX: Scale X dimension
scaleY: Scale Y dimension
scaleZ: Scale Z dimension
scale: Composite scale, value is a JSON object with x, y, z
The following example rotates, translates, and then scales.

"transforms": [
  { "rotateY": 45 },
  { "x": 40, "y": 50, "z": 2 },
  { "scale": { "x": 2, "z": 4 }}
]
Transforms can be especially powerful when combined with Parameters and Instancing.

Outputs
"outputs": [
  {
    "protocol": "artnet",
    "enabled": "$artnetIsOn",
    "universe": 0,
    "host": "127.0.0.1",
    "start": 0,
    "num": 50
  },
  {
    "protocol": "sacn",
    "host": "$stringParam",
    "start": 50,
    "num": 30,
    "reverse": true,
    "byteOrder": "rgbw"
  }
]
Output packets/protocols are specified in a JSON array under the outputs. If only a single packet is needed, this may be supplied directly on the output field. Output definitions may also be specified directly on a component child of the fixture.

protocol: Required string from following
artnet/artdmx: Art-Net DMX
artsync: ArtSync packet (sent after all normal packets)
sacn/e131: Streaming ACN E1.31
ddp: Distributed Display Protocol
opc: Open Pixel Control
kinet: Color Kinetics KiNET
host: String hostname for the destination
port: Optional tcp/udp port number if overriding the protocol default
byteOrder: Optional byte order of pixel data, a three or four character string containing rgb and optionally w (or just w for single-byte output)
fps: Optional value to set a FPS limit for any packets derived from this output (0-300), if not specified the default engine rate is used
enabled: Optional boolean flag, defaults to true when not present
Protocol Specific Fields
artnet
universe: DMX universe
channel: DMX channel offset (0-511)
sequenceEnabled: Whether to increment DMX sequence number
sacn
universe: DMX universe
channel: DMX channel offset (0-511)
priority: E1.31 data priority (0-200)
ddp
dataOffset: Data offset
opc
channel: OPC channel (0-255)
offset: OPC data offset
transport: Optional string, one of udp / tcp
kinet
kinetPort: KiNET port number (0-255)
channel: DMX channel offset (0-511)
DMX Channel Addressing
DMX channels in Chromatik are a 0-indexed offset, with valid range 0-511. Many controllers and systems use 1-512 when referring to DMX channels. Therefore, the number entered in your .lxf file may need to be 1 less than the controller configuration value if that equipment works with the range 1-512.

DMX universes are 0-indexed. Note that while 0 is a valid Art-Net universe, it is not considered valid in sACN E1.31, where it is reserved for future protocol use along with universes between 64000-65535. These should be avoided when using sACN E1.31.

Indexing
Indexing fields specify which points in the fixture are encoded into the output.

start: The integer index, relative to this fixture, of the first point to include in this packet (default is 0)
num: The integer total number of points to send in this packet (if not specified, all points in this fixture are included)
stride: Optional integer number of points to jump by for each sequential point (default is 1)
repeat: Optional, repeat each point N times (default is 1)
duplicate: Optional, repeat the entire output sequence N times (default is 1)
reverse: Optional boolean, if true then the range defined are sent in reverse order
outputStride: Optional, number of output channels to jump for each point (default is the byte order length)
Note that output / outputs may be specified at the top level, or directly on component definitions. In that case, the supplied indices are relative only to the points defined by the sub-fixture, not the entire parent fixture.

Padding + Static DMX Data
Optional fields are available for fixtures which require padding with dummy-pixels or static DMX data that configures the operation of the fixture.

padPre: Number of empty points (all bytes 0) to encode before the indexed points
padPost: Number of empty points (all bytes 0) to encode after the indexed points
headerBytes: Raw bytes of DMX data to serialize before color values
footerBytes: Raw bytes of DMX data to serialize after color values
Note that padPre and padPost specify a number of empty points, not empty bytes. Each point of padding will generate as many DMX output channels as is needed for the given byteOrder (e.g. 3 for RGB, 4 for RGBW).

The headerBytes and footerBytes sequences may be specified as either a hexadecimal string (e.g. "04ba6cdeff") or as a JSON array of numeric values (e.g. [4, 186, 108, 222, 255] or [0x04, 0xba, 0x6c, 0xde, 0xff]).

Custom Byte Encoding
If you require byte ordering that is not some combination of rgbw bytes, you may specify in the byteOrder field the name of a native Java class which provides the methods getNumBytes and writeBytes as defined by the ByteEncoder interface. Note that these must be public static methods on the custom class itself, not instance methods.

package com.mypackage;

/**
 * Example custom byte ordering class for a strange 5-byte ordering
 *
 * LXF file: "byteOrder": "com.mypackage.CustomByteOrder"
 */
public static class CustomByteOrder {

  public static int getNumBytes() {
    return 5;
  }

  public static void writeBytes(
      int argb,
      heronarts.lx.output.LXOutput.GammaTable.Curve gamma,
      byte[] output,
      int offset) {

    final int r = ((argb >> 16) & 0xff);
    final int g = ((argb >> 8) & 0xff);
    final int b = (argb & 0xff);

    output[offset] = (byte) r; // R byte
    output[offset + 1] = 0; // 0 placeholder
    output[offset + 2] = (byte) g; // G byte
    output[offset + 3] = gamma.green[g]; // G byte with gamma adjustment
    output[offset + 4] = gamma.blue[b]; // B byte with gamma adjustment    
  }
}
If an inner class is referenced, the / character must be used in place of the $ character, e.g. "byteOrder": "com.package.MyClass/InnerClass".

Segmenting
To construct a packet in which the encoded points are not all sequential, an array of segments may be defined. This JSON array is a list of JSON dictionaries, each defining a segment using the fields above. All of the segments are concatenated to construct the packet. The example above would send the first 10 points of the fixture in reverse order, followed by the next 20 points, each repeated 3 times inline.

"output": {
  "protocol": "artnet",
  "universe": 0,
  "host": "127.0.0.1",
  "segments": [
    { "start": 0, "num": 10, "reverse": true },
    { "start": 10, "num": 20, "repeat": 3 },
  ]
}
Referencing
In complex fixtures where the number of points is dynamic, it is often easier to reference index ranges using component identifiers rather than with raw numeric start and num offsets. Ranges can be specified in two alternate ways.

componentId: Reference the component with the given id value
componentIndex: Reference the n-th component (0-indexed) in this fixture
The start and num fields are automatically computed as the indices and length of the referenced component. If start and num are still provided, they are treated as offsets within the referenced component.

"output": {
  "protocol": "artnet",
  "universe": 0,
  "host": "127.0.0.1",
  "segments": [
    { "componentId": "namedOne" },
    { "componentIndex": 3, "num": 10 }
  ]
}
This example would construct an output packet that contains all the points in the component with namedOne followed by the first 10 points of the component with index 3.

Instanced components can be referenced using brackets, e.g. if there is an instanced component with identifier stripes then stripes[0], stripes[1], etc. may be used to reference individual instances. The identifier stripes refers the entire collection of instances.

Metadata
"meta": {
  "key1": "FirstData",
  "key2": "9834"
}
Metadata may be supplied using the meta key, either at the top-level of a fixture file or on an individual component definition. Keys and values must both be valid JSON strings.

This data can be queried by animation code using the meta(String key) method of the LXModel class. In general, it is recommended to use tags rather than metadata whenever sufficient.

UI Meshes — ALPHA
NOTE: Implementation is extremely limited, subject to change, and unofficially supported.

"ui": {
  "meshes": [
    {
      "enabled": "$meshEnabled",
      "type": "uniformFill",
      "color": "0xff000000",
      "vertices": ...
    }
  ]
}
Custom fixtures may optionally specify meshes to be drawn in the Preview Window for a more realistic simulation of the installation.

enabled: Optional, whether the mesh is enabled (default is true)
type: Presently must be uniformFill - a single color is used for all faces
color: Hexadecimal ARGB format color 0xxAARRGGBB
Future versions may incorporate more options for coloring and lighting these meshes.

As with components, meshes support use of the instances field with the $instance variable available for substitutions.

Note that the key mesh can be used in lieu of meshes if only a single instance is specified.

Specifying Vertices Manually
"vertices": [
  { "x": 0, "y": 0, "z": 0 },
  { "x": 1, "y": 0, "z": 1 },
  { "x": 0, "y": 1, "z": 0 }
]
Vertices should form triangles with counter-clockwise front-face winding. Helpers are available to generate triangles for rect and cuboid shapes.

"vertices": [
  {
    "type": "rect",
    "axis": "xy", /* one of xy/xz/yx/yz/zx/zy */
    "width": 10,
    "height": 20
  }
]
"vertices": [
  {
    "type": "cuboid",
    "width": 10,
    "height": 20,
    "depth": 30
  }
]
Importing Vertices
Vertices may be imported from a file format supported by assimp, such as .obj. Only vertices are loaded at present, textures and colors are entirely ignored.

"ui": {
  "mesh": {
    "type": "uniformFill",
    "color": "0xff666666",
    "file": "teapot.obj"
  }
}  
The file field specifies the path of a file to import, either in the same directory as the .lxf file or relative to the ~/Chromatik/Fixtures root.