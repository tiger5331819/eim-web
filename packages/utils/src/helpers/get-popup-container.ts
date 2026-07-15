/**
 * If the node is holding inside a form, return the form element,
 * otherwise return the parent node of the given element or
 * the document body if the element is not provided.
 */
export function getPopupContainer(node?: HTMLElement): HTMLElement {
  return (
    node?.closest('form') ?? (node?.parentNode as HTMLElement) ?? document.body
  );
}

/**
 * VxeTable 专用弹窗挂载节点（固定列内 Popconfirm / Dropdown 等）
 * 参考：https://gitee.com/dapppp/ruoyi-plus-vben5/issues/IB1DM3
 */
export function getVxePopupContainer(
  node?: HTMLElement,
  tableId?: string,
): HTMLElement {
  if (!node) return document.body;

  const isInFixedColumn =
    node.closest('.vxe-table--fixed-wrapper') ||
    node.closest('.vxe-table--fixed-left-wrapper') ||
    node.closest('.vxe-table--fixed-right-wrapper');

  if (isInFixedColumn) {
    const tableContainer =
      node.closest('.vxe-table--fixed-wrapper') ||
      node.closest('.vxe-table--fixed-left-wrapper') ||
      node.closest('.vxe-table--fixed-right-wrapper');

    if (tableId && tableContainer) {
      const specificTable = tableContainer.closest(
        `[data-table-id="${tableId}"]`,
      );
      if (specificTable) {
        return specificTable as HTMLElement;
      }
    }

    return tableContainer as HTMLElement;
  }

  const fixedHeightElement = node.closest('td.col--cs-height');
  if (fixedHeightElement) {
    (fixedHeightElement as HTMLTableCellElement).style.overflow = 'visible';
  }

  return (node.parentNode as HTMLElement) || document.body;
}
