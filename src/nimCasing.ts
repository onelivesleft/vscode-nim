/*---------------------------------------------------------
 * Copyright (C) Xored Software Inc., RSDuck All rights reserved.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------*/

import vscode = require('vscode');

function casingSplit(sym: string): [boolean, string[]] {
    if (!sym.match(/\w+/)) return [false, [sym]]; // exclude operators
    if (sym === sym.toUpperCase()) sym = sym.toLowerCase(); // for C_IDENTIFIERS_LIKE_SO
    let start = 0;
    let capital = sym[0].toUpperCase() === sym[0];
    let result: string[] = [];
    for (let i = 0; i < sym.length; i++) {
        if (i > 0 && ((sym[i].toUpperCase() === sym[i] && sym[i] !== '_') || sym[i - 1] === '_')) {
            let wasUnderscore = sym[i - 1] === '_' ? 1 : 0;
            result.push(sym.substring(start, i - wasUnderscore).toLowerCase());
            start = i;
        }
    }
    result.push(sym.substring(start, sym.length).toLowerCase());
    if (result[result.length - 1] === '=') {
        result.pop();
        result[result.length - 1] = result[result.length - 1] + '=';
    }
    return [capital, result];
}

function toCamelPascalCase(sym: string) {
    let parts = casingSplit(sym);
    if (parts[0]) {
        let assembled = '';
        for (let i = 0; i < parts[1].length; i++) {
            assembled += parts[1][i][0].toUpperCase() + parts[1][i].substring(1, parts[1][i].length);
        }
        return assembled;
    } else {
        let assembled = parts[1][0];
        for (let i = 1; i < parts[1].length; i++)
            assembled += parts[1][i][0].toUpperCase() + parts[1][i].substring(1, parts[1][i].length);
        return assembled;
    }
}

function toSnakeCase(sym: string): string {
    let parts = casingSplit(sym);
    if (parts[0]) {
        let assembled = parts[1][0][0].toUpperCase() + parts[1][0].substring(1, parts[1][0].length);
        for (let i = 1; i < parts[1].length; i++)
            assembled += '_' + parts[1][i][0].toUpperCase() + parts[1][i].substring(1, parts[1][i].length);
        return assembled;
    } else {
        let assembled = parts[1][0];
        for (let i = 1; i < parts[1].length; i++) {
            assembled += '_' + parts[1][i];
        }
        return assembled;
    }
}

function keepCasing(sym: string): string { return sym; }

let
    nimCasingConfig = new Map<string, (sym: string) => string>();

export function configureCasing(config: vscode.WorkspaceConfiguration) {
    function toFunction(mode: string): (sym: string) => string {
        switch (mode) {
            case 'pascal-camel':
                return toCamelPascalCase;
            case 'snake':
                return toSnakeCase;
        }
        return keepCasing;
    }

    let typeCasing = toFunction(config['typeCasing']);
    let moduleCasing = toFunction(config['moduleCasing']);
    let procLikeCasing = toFunction(config['procLikeCasing']);
    let constantCasing = toFunction(config['constantCasing']);
    let enumFieldCasing = toFunction(config['enumFieldCasing']);
    let variableCasing = toFunction(config['variableCasing']);

    nimCasingConfig.set('skConst', constantCasing);
    nimCasingConfig.set('skEnumField', enumFieldCasing);
    nimCasingConfig.set('skForVar', variableCasing);
    nimCasingConfig.set('skIterator', procLikeCasing);
    nimCasingConfig.set('skLabel', variableCasing);
    nimCasingConfig.set('skLet', variableCasing);
    nimCasingConfig.set('skMacro', procLikeCasing);
    nimCasingConfig.set('skMethod', procLikeCasing);
    nimCasingConfig.set('skParam', variableCasing);
    nimCasingConfig.set('skProc', procLikeCasing);
    nimCasingConfig.set('skResult', variableCasing);
    nimCasingConfig.set('skTemplate', procLikeCasing);
    nimCasingConfig.set('skType', typeCasing);
    nimCasingConfig.set('skVar', variableCasing);
    nimCasingConfig.set('skField', variableCasing);
    nimCasingConfig.set('skAlias', typeCasing);
    nimCasingConfig.set('skModule', moduleCasing);
}

export function getCasingConfig(): Map<string, (sym: string) => string> {
    return nimCasingConfig;
}
