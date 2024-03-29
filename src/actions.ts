
import { readFileSync, statSync, writeFileSync, unlinkSync, existsSync, renameSync } from 'fs'
import { join, parse, basename } from 'path'
import utils from './utils'
import cli from './cli'
import routes from './routes'

const { version } = require("../package.json")

export default {

  /**
   * Command documentation
   * @type {Object} doc
   */
  doc: {
    /**
     * Absolute path
     * @param {String} docname
     * @return {String}
     */
    abspath(docname: string): string {
      return join(__dirname, 'doc', docname.concat('.txt'))
    },

    /**
     * @param {String} docname
     * @return {void}
     */
    print(docname: string): void {
      process.stdout.write(readFileSync(this.abspath(docname), 'UTF-8'))
    }, 

    // App command
    commands(): void {
      this.print('tcg')
    }, 

    // App version
    version(): void {
      process.stdout.write(`\nVersion ${version}\n`)
    }, 
    generate(): void {
      this.print('generate')
    },
    use(): void {
      this.print('use')
    },
    remove(): void {
      this.print('remove')
    }, 
    rename(): void {
      this.print('rename')
    }, 
    view(): void {
      this.print('view')
    }
  },

  /**
   * Generating templates
   * @return {void}
   */
  generate(): void {
    const { files } = cli
    if (files.length) {

      // Flags point to specific origin e.g. tcg g app.js --react
      const flags = (cli.flags.length)? cli.flags: ['_']

      for (const file of cli.files) {
        const { ext } = parse(file)

        // By matching extension
        const availtemp: Array<string> = utils.list
            .filter((temp: string) => (parse(temp).ext === ext)? temp: null)

        if (availtemp.length) {
          // Match the flag value
          const requiredtemp: Array<string> = availtemp
              .filter((item: string) => (flags.includes(parse(item).name))? item: null)

          for (const publishtemp of requiredtemp) {
            // Copying to the current dir
            writeFileSync(`${process.env.PWD}/${file}`, readFileSync(publishtemp), "UTF-8")
          }
        } else {
          process.stdout.write(`Cannot find template with ${utils.errorText(ext)} extension.\n`)
        }
      }
    } else {
      // If file parameter is not supplied
      this.doc.generate()
    }
  },

  /**
   * Add new template
   * @return {void}
   */
  use(): void {
    const { files } = cli
    if (files.length) {
      for (const file of files) {
        const abspath: string = join(process.env.PWD, file)
        utils.add(abspath)
      }
    } else {
      // Command help
      this.doc.use()
    }
  },

  /**
   * Listing all existing templates
   * @return {void}
   */
  list(): void {
    const { list } = utils
    process.stdout.write(`${list.length} Active templates\n\n`)

    for (const item of list) {
      const bdate: Date = new Date(statSync(item).birthtime)
      const { ext, name } = parse(item)
      process.stdout.write(`${bdate.toLocaleString()}\t${utils.cyanText(ext)}\t${utils.magentaText((name === '_')? '-': name)}\n`)
    }
  },

  /**
   * Remove template from storage
   * @return {void}
   */
  remove(): void {
    const { files } = cli

    if (files.length) {

      for (const file of files) {
        // Single template file
        const storagetemp: string = utils.list
              .find((temp: string) => parse(temp).base === file)

        try {
          if (!storagetemp) {
            throw (`Template <${utils.errorText(file)}> not available inside storage\n`)
          }
          // Delete template file
          unlinkSync(storagetemp)
        } catch(err) {
          process.stdout.write(err)
        }
      }
    } else {
      // Command help
      this.doc.remove()
    }
  }, 
  
  rename(): void {
    const [ oldname, newname ] = cli.files
        .slice(0, 2)
        .map((file: string) => join(routes.prefix, file))

    if (oldname && newname) {
      try {
        if (!existsSync(oldname)) {
          throw(`Cannot find <${utils.errorText(basename(oldname))}> in storage\n`)
        }
        renameSync(oldname, newname)
      } catch (error) {
        process.stdout.write(error)
      }
    } else {
      this.doc.rename()
    }
  }, 

  /**
   * Write the content of files on term console
   * @return {void}
   */
  view(): void {
    const { files } = cli

    if (files.length) {
      files.forEach((file: string) => {
        const abspath: string = join(routes.prefix, file)
        if (existsSync(abspath)) {
          process.stdout.write(readFileSync(abspath, "UTF-8"))
        }
      })
    } else {
      this.doc.view()
    }
  }
}