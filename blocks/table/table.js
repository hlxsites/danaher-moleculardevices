function buildCell(rowIndex, dataAlign) {
    const cell = rowIndex ? document.createElement('td') : document.createElement('th');
    if (!rowIndex) cell.setAttribute('scope', 'col');
    if (dataAlign) cell.className = dataAlign;
    return cell;
  }
  
  export default async function decorate(block) {
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    table.append(thead, tbody);
    [...block.children].forEach((child, i) => {
      const row = document.createElement('tr');
      if (i) tbody.append(row);
      else thead.append(row);
      [...child.children].forEach((col) => {
        const cell = buildCell(i, col.getAttribute('data-align'));
        cell.innerHTML += col.innerHTML;
        row.append(cell);
      });
    });
    block.innerHTML = '';
    block.append(table);
  }