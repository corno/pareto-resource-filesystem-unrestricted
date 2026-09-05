import * as p_ from 'pareto-core/resource'
import p_change_context from 'pareto-core/refiner/specials/change_context'
import * as p_s from 'pareto-core/serializer'

//interface
import * as interface_ from "pareto-filesystem-unrestricted-api/modules/unrestricted/commands/interfaces"


//dependencies
import { cp as fs_cp } from "fs"
import * as ser_path from "pareto-filesystem-unrestricted-api/modules/unrestricted/schemas/path/serializers"

export const $$: interface_.copy = p_.command(($p, on_success, on_error) => {
    const options: any = {}
    if ($p.options.recursive) {
        options.recursive = true
    }
    if ($p.options.force) {
        options.force = true
    }
    if ($p.options.errorOnExist) {
        options.errorOnExist = true
    }

    fs_cp(
        ser_path.Node_Path($p.source),
        ser_path.Node_Path($p.target),
        options,
        (err) => {
            if (err) {
                on_error({
                    'path': $p.source,
                    'type': p_change_context(null, () => {
                        if (err.code === 'ENOENT') {
                            return ['source does not exist', null]
                        }
                        if (err.code === 'EACCES' || err.code === 'EPERM') {
                            return ['permission denied', null]
                        }
                        if (err.code === 'EISDIR' || err.code === 'ERR_FS_EISDIR') {
                            return ['node is not a file', null]
                        }
                        if (err.code === 'EFBIG') {
                            return ['file too large', null]
                        }
                        if (err.code === 'EIO' || err.code === 'ENXIO') {
                            return ['device not ready', null]
                        }
                        throw new Error(`unhandled fs.cp error code: ${err.code}`)
                    })
                })
            } else {
                on_success()
            }
        }
    )
})