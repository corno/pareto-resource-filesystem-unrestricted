import * as p_ from 'pareto-core/interface/resource'

import { $$ as p_fs_unrestricted_chmod } from "./commands/chmod.js"
import { $$ as p_fs_unrestricted_copy } from "./commands/copy.js"
import { $$ as p_fs_unrestricted_make_directory } from "./commands/make_directory.js"
import { $$ as p_fs_unrestricted_remove } from "./commands/remove.js"
import { $$ as p_fs_unrestricted_write_file } from "./commands/write_file.js"

import { $$ as q_fs_unrestricted_read_directory } from "./queries/read_directory.js"
import { $$ as q_fs_unrestricted_read_file } from "./queries/read_file.js"
// import { $$ as q_fs_unrestricted_stat } from "./queries/stat.js"
import { $$ as q_fs_unrestricted_stat_possible_node } from "./queries/stat_possible_node.js"

export const $ = {
    'commands': {
        'chmod': p_fs_unrestricted_chmod,
        'copy': p_fs_unrestricted_copy,
        'make directory': p_fs_unrestricted_make_directory,
        'remove': p_fs_unrestricted_remove,
        'write file': p_fs_unrestricted_write_file,

    },
    'queries': {
        'read directory': q_fs_unrestricted_read_directory,
        'read file': q_fs_unrestricted_read_file,
        // 'stat': q_fs_unrestricted_stat,
        'stat possible node': q_fs_unrestricted_stat_possible_node,
    }
} satisfies p_.Resource