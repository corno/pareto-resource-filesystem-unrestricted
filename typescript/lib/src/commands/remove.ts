import * as p_ from 'pareto-core/implementation/resource'
import p_change_context from 'pareto-core/implementation/refiner/specials/change_context'
import * as p_s from 'pareto-core/implementation/serializer'

//interface
import * as interface_ from "pareto-filesystem-unrestricted-api/interface/commands"

//dependencies
import { rm as fs_rm } from "fs"
import * as ser_path from "pareto-filesystem-unrestricted-api/implementation/serializers/unrestricted_path"


export const $$: interface_.remove = p_.command(($p, on_success, on_error) => {
    fs_rm(
        p_s.text_from_phrase(
            ser_path.Context_Path($p.path),
            "",
            "\n"
        ),
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
                                throw new Error(`FIXME: implement ENOTDIR error handling (path: ${p_s.text_from_phrase(
                                    ser_path.Context_Path($p.path),
                                    "",
                                    "\n"
                                )})`)
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