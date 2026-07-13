import * as p_ from 'pareto-core/implementation/resource'
import * as p_s from 'pareto-core/implementation/serializer'
import p_change_context from 'pareto-core/implementation/refiner/specials/change_context'
import p_text_from_list from 'pareto-core/implementation/transformer/specials/text_from_list'

//interface
import * as interface_ from "pareto-filesystem-unrestricted-api/interface/commands"


//dependencies
import { mkdir as fs_mkdir, writeFile as fs_writeFile } from "fs"
import * as ser_path from "pareto-filesystem-unrestricted-api/implementation/serializers/unrestricted_path"

export const $$: interface_.write_file = p_.command(($p, on_success, on_error) => {

    fs_mkdir(
        p_s.text_from_phrase(
            ser_path.Context_Path($p.path.context),
            "",
            "\n"
        ),
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
                p_s.text_from_phrase(
                    ser_path.Node_Path($p.path),
                    "",
                    "\n"
                ),
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