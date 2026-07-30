import * as p_ from 'pareto-core/implementation/resource'
import p_change_context from 'pareto-core/implementation/refiner/specials/change_context'
import * as p_s from 'pareto-core/implementation/serializer'

//data types
import * as d from "pareto-filesystem-unrestricted-api/modules/unrestricted/schemas/chmod/schema"

//interface
import * as interface_ from "pareto-filesystem-unrestricted-api/modules/unrestricted/commands/interfaces"


//dependencies
import { chmod as fs_chmod } from "fs"

import * as ser_path from "pareto-filesystem-unrestricted-api/modules/unrestricted/schemas/path/serializers"

export const $$: interface_.chmod = p_.command(($p, on_success, on_error) => {
    // Convert permissions structure to numeric mode
    let mode = 0

    // Special bits (optional)

    const sb = $p.mode['special bits'].__get_raw()
    if (sb !== null) {
        if (sb[0].setuid) {
            mode += 0o4000
        }
        if (sb[0].setgid) {
            mode += 0o2000
        }
        if (sb[0].sticky) {
            mode += 0o1000
        }
    }

    // Owner, group, others

    function permissions_to_octal(permissions: d.Permissions): number {
        let value = 0
        if (permissions.read) {
            value += 4
        }
        if (permissions.write) {
            value += 2
        }
        if (permissions.execute) {
            value += 1
        }
        return value
    }

    mode += permissions_to_octal($p.mode.owner) * 0o100
    mode += permissions_to_octal($p.mode.group) * 0o10
    mode += permissions_to_octal($p.mode.others) * 0o1

    fs_chmod(
        ser_path.Node_Path($p.path),
        mode,
        (err) => {
            if (err) {
                on_error({
                    'path': $p.path,
                    'type': p_change_context(null, () => {
                        if (err.code === 'ENOENT') {
                            return ['path does not exist', null]
                        }
                        if (err.code === 'EACCES' || err.code === 'EPERM') {
                            return ['permission denied', null]
                        }
                        throw new Error(`unhandled fs.chmod error code: ${err.code}`)
                    })
                })
            } else {
                on_success()
            }
        }
    )
})