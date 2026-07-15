import * as p_ from 'pareto-core/implementation/resource'
import p_change_context from 'pareto-core/implementation/refiner/specials/change_context'

//interface
import * as interface_ from "pareto-filesystem-unrestricted-api/interface/commands"


//dependencies
import { mkdir as fs_mkdir, createWriteStream as fs_createWriteStream } from "fs"
import * as ser_path from "pareto-filesystem-unrestricted-api/implementation/serializers/unrestricted_path"

export const $$: interface_.write_file = p_.command(($p, on_success, on_error) => {

    fs_mkdir(
        ser_path.Context_Path($p.path.context),
        {
            'recursive': true
        },
        (err, path) => {
            if (err) {
                on_error({
                    'path': $p.path,
                    'type': p_change_context(null, () => {
                        if (err.code === 'EACCES' || err.code === 'EPERM') {
                            return ['permission denied', null]
                        }
                        throw new Error(`unhandled fs.writeFile error code: ${err.code}`)
                    })
                })
                return
            }

            const stream = fs_createWriteStream(ser_path.Node_Path($p.path), { 'encoding': 'utf-8' })

            stream.on('error', (err: NodeJS.ErrnoException) => {
                on_error({
                    'path': $p.path,
                    'type': p_change_context(null, () => {
                        if (err.code === 'EACCES' || err.code === 'EPERM') {
                            return ['permission denied', null]
                        }
                        throw new Error(`unhandled fs.createWriteStream error code: ${err.code}`)
                    })
                })
            })

            stream.on('finish', () => {
                on_success()
            })

            const lines = $p.content.lines.__get_raw()
            for (let i = 0; i < lines.length; i++) {
                stream.write(lines[i])
                stream.write($p.content.newline)
            }
            stream.end()
        }
    )
})