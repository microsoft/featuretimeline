import { IDimension } from "../types";

export function getRowColumnStyle(dimension: IDimension) {
    if (!dimension) {
        return {};
    }
    return getStyle(dimension.startRow, dimension.endRow, dimension.startCol, dimension.endCol);
}


export function getStyle(startRow, endRow, startCol, endCol) {
    return {
        'grid-column': `${startCol} / ${endCol}`,
        'grid-row': `${startRow} / ${endRow}`,
        '-ms-grid-row': `${startRow}`,
        '-ms-grid-row-span': `${endRow - startRow}`,
        '-ms-grid-column': `${startCol}`,
        '-ms-grid-column-span': `${endCol - startCol}`
    }
}

export function getTemplateColumns(fixedColumns: string[], count: number, size: string) {
    let str = '';
    for (let i = 0; i < count; i++) {
        str = str + size + ' ';
    }

    const fixedColumnsStr = fixedColumns.join(' ');

    return {
        'grid-template-columns': `${fixedColumnsStr} repeat(${count}, ${size})`,
        '-ms-grid-columns': `${fixedColumnsStr} ${str}`
    };
}