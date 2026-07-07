import * as p_ from 'pareto-core/implementation/resource'
import p_change_context from 'pareto-core/implementation/refiner/specials/change_context'

//interface
import * as interface_ from "pareto-filesystem-unrestricted-api/interface/query_actions"


//dependencies
import { stat as fs_stat } from "fs"
import * as t_path_to_text from "pareto-filesystem-unrestricted-api/implementation/manual/transformers/unrestricted_path/text"

export const $$: interface_.stat_possible_node = p_.query(($p, on_value, on_error) => {
    fs_stat(
        t_path_to_text.Node_Path($p),
        (err, stats) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    on_value(['does not exist', null])
                } else {
                    on_error({
                        'path': $p,
                        'type': p_change_context(null, () => {
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