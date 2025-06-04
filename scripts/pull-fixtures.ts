import * as fs from "fs"
import * as path from "path"
import { logger } from "src/lib/logger"

require("dotenv").config({ path: ".env.local" })

const copyRecursiveSync = (src: string, dest: string) => {
  if (fs.existsSync(src)) {
    logger.info("Copying", src, "to", dest)
    const stats = fs.statSync(src)
    const isDirectory = stats.isDirectory()

    if (isDirectory) {
      fs.mkdirSync(dest, { recursive: true })
      fs.readdirSync(src).forEach((childItemName) => {
        copyRecursiveSync(
          path.join(src, childItemName),
          path.join(dest, childItemName)
        )
      })
    } else {
      logger.info("Copying", src, "to", dest)
      fs.copyFileSync(src, dest)
    }
  } else {
    logger.info("Does not exist", src)
  }
}

const fixturesPath = process.env.FIXTURES_PATH
console.log(fixturesPath)

if (!fixturesPath) {
  logger.error(
    "No fixtures path provided. Add FIXTURES_PATH to .env.local file."
  )
  process.exit(1)
}

const fixturesDestPath = path.join(__dirname, "..", "src", "assets", "fixtures")
copyRecursiveSync(fixturesPath, fixturesDestPath)

logger.info("Done.")
