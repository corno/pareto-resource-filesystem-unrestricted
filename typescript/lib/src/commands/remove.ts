import * as p_ from 'pareto-core/implementation/resource'
import p_change_context from 'pareto-core/implementation/refiner/specials/change_context'

//interface
import * as interface_ from "pareto-filesystem-unrestricted-api/interface/commands"

//dependencies
import { rm as fs_rm } from "fs"
import * as t_path_to_text from "pareto-filesystem-unrestricted-api/implementation/transformers/unrestricted_path/text"


export const $$: interface_.remove = p_.command(($p, on_success, on_error) => {
    fs_rm(
        t_path_to_text.Context_Path($p.path),
        {
            'recursive': true,
        },
        (err) => {

            if (err) {
                if (err.code === 'ENOENT' && !$p['error if not exists']) {
                    on_success()
                } else {
                    on_error({
                        'path': $p.path,
                        'type': p_change_context(null, () => {
                            if (err.code === 'ENOENT') {
                                return ['node does not exist', null]
                            }
                            if (err.code === 'EACCES' || err.code === 'EPERM') {
                                return ['permission denied', null]
                            }
                            if (err.code === 'ENOTDIR') {
                                throw new Error(`FIXME: implement ENOTDIR error handling (path: ${t_path_to_text.Context_Path($p.path)})`)
                            }
                            throw new Error(`unhandled fs.rm error code: ${err.code}`)
                        })
                    })
                }
            } else {
                on_success()
            }
        }
    )
})