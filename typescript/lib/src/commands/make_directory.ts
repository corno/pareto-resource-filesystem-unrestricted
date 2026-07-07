import * as p_ from 'pareto-core/implementation/resource'
import p_change_context from 'pareto-core/implementation/refiner/specials/change_context'

//interface
import * as resources from "pareto-resources/interface/resources"

//dependencies
import { mkdir as fs_mkdir } from "fs"
import { rm as fs_remove } from "fs"
import * as t_path_to_text from "pareto-resources/implementation/manual/transformers/unrestricted_path/text"

export const $$: resources.filesystem_unrestricted.commands.make_directory = p_.command(($p, on_success, on_error) => {
    const make_directory = () => {
        fs_mkdir(
            t_path_to_text.Node_Path($p.path),
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
            t_path_to_text.Node_Path($p.path),
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