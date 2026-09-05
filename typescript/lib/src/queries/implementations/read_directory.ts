import * as p_ from 'pareto-core/resource'
import * as p_r from 'pareto-core/refiner'
import * as p_s from 'pareto-core/serializer'
import * as p_di from 'pareto-core/schema'
import p_change_context from 'pareto-core/refiner/specials/change_context'

import p_unreachable_code_path from 'pareto-core/transformer/specials/unreachable_code_path'


//interface
import * as interface_ from "pareto-filesystem-unrestricted-api/modules/unrestricted/queries/interfaces"


//data types
import * as d_xxx from "pareto-filesystem-unrestricted-api/modules/unrestricted/schemas/read_directory/schema"

//dependencies
import { readdir as fs_readdir } from "fs"
import * as ser_path from "pareto-filesystem-unrestricted-api/modules/unrestricted/schemas/path/serializers"
import * as t_path_to_path from "pareto-filesystem-unrestricted-api/modules/unrestricted/schemas/path/transformers/path"

type ID_Value_Pair<T extends p_di.Value> = {
    readonly 'id': string
    readonly 'value': T
}


export const $$: interface_.read_directory = p_.query(($p, on_value, on_error) => {
    fs_readdir(
        ser_path.Context_Path($p.path),
        {
            'encoding': 'utf-8',
            'withFileTypes': true,
        },
        (err, nodes) => {
            if (err) {
                on_error({
                    'path': $p.path,
                    'type': p_change_context(null, () => {
                        if (err.code === 'ENOENT') {
                            return ['directory does not exist', null]
                        }
                        if (err.code === 'ENOTDIR' || err.code === 'EISDIR') {
                            return ['node is not a directory', null]
                        }
                        throw new Error(`unhandled fs.readdir error code: ${err.code}`)
                    })
                })
            } else {
                const nodes2 = nodes.map(($): ID_Value_Pair<d_xxx.Result.D> => ({
                    'id': $.name,
                    'value': {
                        'node type': $.isFile()
                            ? ['file', null]
                            : $.isDirectory()
                                ? ['directory', null]
                                : ['other', null],
                        'context directory': $p.path,
                        'path': t_path_to_path.create_node_path(
                            $p.path,
                            {
                                'node': $.name,
                            }
                        )
                    }
                }))
                on_value(
                    p_r.from.list(
                        p_.literal.list(nodes2),
                    ).convert_to_dictionary(
                        ($) => $.id,
                        ($) => $.value,
                        {
                            duplicate_id: ($) => p_unreachable_code_path("the nodejs api guarantees that all items will have a unique name")
                        },
                    )
                )
            }
        }
    )
})