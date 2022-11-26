let medium = [M1]
let hard = [H1]
let evil = [E1, E2]

import {default as M1} from "./M1.json" assert {type: "json"}
import {default as H1} from "./H1.json" assert {type: "json"}
import {default as E1} from "./E1.json" assert {type: "json"}
import {default as E2} from "./E2.json" assert {type: "json"}

export const stages = [medium, hard, evil]