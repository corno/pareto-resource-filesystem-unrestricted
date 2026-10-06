import * as p_ from 'pareto-core/resource'
import p_change_context from 'pareto-core/refiner/specials/change_context'
import * as p_s from 'pareto-core/serializer'
//interface
import * as interface_ from "pareto-filesystem-unrestricted-api/modules/unrestricted/queries/interfaces"


//dependencies
import { stat as fs_stat } from "fs"
import * as ser_path from "pareto-filesystem-unrestricted-api/modules/unrestricted/schemas/path/serializers"

export const $$: interface_.stat_possible_node = p_.query(($p, on_value, on_error) => {
    fs_stat(
        ser_path.Node_Path($p),
        (err, stats) => {
            if (err) {
                // the node or a part of its context is missing (or a symlink is broken)
                if (err.code === 'ENOENT') {
                    on_value(['does not exist', ['no such entry', null]])
                // a part of the context is not a directory
                } else if (err.code === 'ENOTDIR') {
                    on_value(['does not exist', ['context is not a directory', null]])
                } else {
                    on_error({
                        'path': $p,
                        'type': p_change_context(null, () => {
                            if (err.code === 'EACCES' || err.code === 'EPERM') {
                                return ['permission denied', null]
                            }
                            throw new Error(`unhandled fs.stat error code: ${err.code}`)
                        })
                    })
                }
            } else {
                on_value(stats.isFile()
                    ? ['file', null]
                    : ['directory', null]
                )
            }
        }
    )
})