import * as p_ from 'pareto-core/implementation/resource'
import * as p_r from 'pareto-core/implementation/refiner'
import * as p_di from 'pareto-core/interface/data'
import p_change_context from 'pareto-core/implementation/refiner/specials/change_context'

import p_unreachable_code_path from 'pareto-core/implementation/transformer/specials/unreachable_code_path'


//interface
import * as interface_ from "pareto-filesystem-unrestricted-api/interface/query_actions"


//data types
import * as d_xxx from "pareto-filesystem-unrestricted-api/interface/generated/liana/schemas/fs_unrestricted_read_directory/data"

//dependencies
import { readdir as fs_readdir } from "fs"
import * as t_path_to_text from "pareto-filesystem-unrestricted-api/implementation/manual/transformers/unrestricted_path/text"
import * as t_path_to_path from "pareto-filesystem-unrestricted-api/implementation/manual/transformers/unrestricted_path/unrestricted_path"

type ID_Value_Pair<T extends p_di.Value> = {
    readonly 'id': string
    readonly 'value': T
}


export const $$: interface_.read_directory = p_.query(($p, on_value, on_error) => {
    fs_readdir(
        t_path_to_text.Context_Path($p.path),
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