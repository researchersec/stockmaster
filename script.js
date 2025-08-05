document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun');
    const moonIcon = document.getElementById('moon');
    
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }

    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        if (document.documentElement.classList.contains('dark')) {
            localStorage.theme = 'dark';
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            localStorage.theme = 'light';
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    });

    // Fetch and display stock data
    fetch('data/stocks.json')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('stock-table');
            tableBody.innerHTML = '';
            data.forEach(stock => {
                const changeClass = stock.change_percent >= 0 ? 'text-green-500' : 'text-red-500';
                const row = `
                    <tr class="border-b dark:border-gray-700">
                        <td class="py-2">${stock.symbol}</td>
                        <td class="py-2">$${stock.close.toFixed(2)}</td>
                        <td class="py-2 ${changeClass}">${stock.change_percent.toFixed(2)}%</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => {
            console.error('Error fetching stock data:', error);
            document.getElementById('stock-table').innerHTML = '<tr><td colspan="3" class="py-2 text-center">Error loading stock data</td></tr>';
        });
});
