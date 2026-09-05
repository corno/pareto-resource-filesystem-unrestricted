import * as p_ from 'pareto-core/resource'
import p_change_context from 'pareto-core/refiner/specials/change_context'
import * as p_s from 'pareto-core/serializer'


//interface
import * as interface_ from "pareto-filesystem-unrestricted-api/modules/unrestricted/queries/interfaces"


//dependencies
import { stat as fs_stat } from "fs"
import * as ser_path from "pareto-filesystem-unrestricted-api/modules/unrestricted/schemas/path/serializers"

export const $$: interface_.stat = p_.query(($p, on_value, on_error) => {
    fs_stat(
        ser_path.Node_Path($p),
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