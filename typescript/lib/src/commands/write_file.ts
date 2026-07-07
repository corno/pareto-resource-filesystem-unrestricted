import * as p_ from 'pareto-core/implementation/resource'
import p_change_context from 'pareto-core/implementation/refiner/specials/change_context'
import p_text_from_list from 'pareto-core/implementation/transformer/specials/text_from_list'

//interface
import * as interface_ from "pareto-filesystem-unrestricted-api/interface/command_actions"


//dependencies
import { mkdir as fs_mkdir, writeFile as fs_writeFile } from "fs"
import * as t_path_to_text from "pareto-filesystem-unrestricted-api/implementation/manual/transformers/unrestricted_path/text"

export const $$: interface_.write_file = p_.command(($p, on_success, on_error) => {

    fs_mkdir(
        t_path_to_text.Context_Path($p.path.context),
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
            fs_writeFile(
                t_path_to_text.Node_Path($p.path),
                p_text_from_list($p.data, ($) => $),
                (err) => {
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
                    } else {
                        on_success()
                    }
                }
            )
        }
    )
})