// modules/tableFunctions.js

export async function fetchTables() {
    try {
        const response = await fetch('/tables'); // Adjust the URL as per your API endpoint
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const tables = await response.json();
        return tables;
    } catch (error) {
        throw new Error('Error fetching tables:', error);
    }
}

export function displayTables(tables) {
    const tableListElement = document.getElementById('tableList');
    tables.forEach(table => {
        const tableElement = document.createElement('div');
        tableElement.innerHTML = `
            <p>ID: ${table.ID_TABLE}</p>
            <p>Name: ${table.TABLE_NUM}</p>
            <p>Capacity: ${table.TABLE_PAX}</p>
            <hr>
        `;
        tableListElement.appendChild(tableElement);
    });
}
