
import * as p_ from 'pareto-core/implementation/resource'
import p_change_context from 'pareto-core/implementation/refiner/specials/change_context'
import p_list_from_text from 'pareto-core/implementation/refiner/specials/list_from_text'


//interface
import * as resources from "pareto-resources/interface/resources"

//dependencies
import * as t_path_to_text from "pareto-resources/implementation/manual/transformers/unrestricted_path/text"
import { readFile as fs_readFile } from "fs"

export const $$: resources.filesystem_unrestricted.queries.read_file = p_.query(($p, on_value, on_error) => {
    fs_readFile(
        t_path_to_text.Node_Path($p),
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
                on_value(p_list_from_text(
                    data,
                    ($) => $
                ))
            }
        }
    )
})