
import * as p_ from 'pareto-core/resource'
import p_change_context from 'pareto-core/refiner/specials/change_context'
import * as p_s from 'pareto-core/serializer'


//interface
import * as interface_ from "pareto-filesystem-unrestricted-api/modules/unrestricted/queries/interfaces"


//dependencies
import * as ser_path from "pareto-filesystem-unrestricted-api/modules/unrestricted/schemas/path/serializers"
import { readFile as fs_readFile } from "fs"

export const $$: interface_.read_file = p_.query(($p, on_value, on_error) => {
    fs_readFile(
        ser_path.Node_Path($p),
        { 'encoding': 'utf-8' },
        (err, data) => {
            if (err) {
                on_error({
                    'path': $p,
                    'type': p_change_context(null, () => {
                        if (err.code === 'ENOENT') {
                            return ['file does not exist', null]
                        }
                        if (err.code === 'EACCES' || err.code === 'EPERM') {
                            return ['permission denied', null]
                        }
                        if (err.code === 'EISDIR' || err.code === 'ENOTDIR') {
                            return ['node is not a file', null]
                        }
                        if (err.code === 'EFBIG') {
                            return ['file too large', null]
                        }
                        if (err.code === 'EIO' || err.code === 'ENXIO') {
                            return ['device not ready', null]
                        }
                        throw new Error(`unhandled fs.readFile error code: ${err.code}`)
                    })
                })
            } else {
                on_value({
                    'data': p_.literal.list(Array.from(data).map(c => c.codePointAt(0)!))
                })
            }
        }
    )
})