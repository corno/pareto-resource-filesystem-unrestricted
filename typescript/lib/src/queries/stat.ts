import * as p_ from 'pareto-core/implementation/resource'
import p_change_context from 'pareto-core/implementation/refiner/specials/change_context'


//interface
import * as resources from "pareto-resources/interface/resources"

//dependencies
import { stat as fs_stat } from "fs"
import * as t_path_to_text from "pareto-resources/implementation/manual/transformers/unrestricted_path/text"

export const $$: resources.filesystem_unrestricted.queries.stat = p_.query(($p, on_value, on_error) => {
    fs_stat(
        t_path_to_text.Node_Path($p),
        (err, stats) => {
            if (err) {
                on_error({
                    'path': $p,
                    'type': p_change_context(null, () => {
                        if (err.code === 'ENOENT') {
                            return ['node does not exist', null]
                        }
                        throw new Error(`unhandled fs.stat error code: ${err.code}`)
                    })
                })
            }
            on_value(stats.isFile()
                ? ['file', null]
                : ['directory', null]
            )
        }
    )
})