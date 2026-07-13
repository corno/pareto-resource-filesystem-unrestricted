import * as p_ from 'pareto-core/implementation/resource'
import * as p_s from 'pareto-core/implementation/serializer'
import p_change_context from 'pareto-core/implementation/refiner/specials/change_context'

//interface
import * as interface_ from "pareto-filesystem-unrestricted-api/interface/commands"


//dependencies
import { mkdir as fs_mkdir } from "fs"
import { rm as fs_remove } from "fs"
import * as ser_path from "pareto-filesystem-unrestricted-api/implementation/serializers/unrestricted_path"

export const $$: interface_.make_directory = p_.command(($p, on_success, on_error) => {
    const make_directory = () => {
        fs_mkdir(
            p_s.text_from_phrase(
                ser_path.Node_Path($p.path),
                "",
                "\n"
            ),
            {
                'recursive': true,
            },
            (err, path) => {
                if (err) {
                    on_error({
                        'path': $p.path,
                        'type': p_change_context(null, () => {
                            if (err.code === 'EEXIST') {
                                return ['directory already exists', null]
                            }
                            throw new Error(`unhandled fs.mkdir error code: ${err.code}`)
                        })
                    })
                } else {
                    on_success()
                }
            }
        )
    }
    if ($p['delete existing']) {
        fs_remove(
            p_s.text_from_phrase(
                ser_path.Node_Path($p.path),
                "",
                "\n"
            ),
            {
                'recursive': true,
                'force': true,
            },
            (err) => {
                if (err) {
                    on_error({
                        'path': $p.path,
                        'type': p_change_context(null, () => {
                            if (err.code === 'EACCES' || err.code === 'EPERM') {
                                return ['permission denied', null]
                            }
                            throw new Error(`unhandled fs.rm error code: ${err.code}`)
                        })
                    })
                } else {
                    make_directory()
                }
            }
        )

    } else {
        make_directory()
    }
})