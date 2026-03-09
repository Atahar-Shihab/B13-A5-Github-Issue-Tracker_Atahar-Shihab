const issuesGrid = document.getElementById('issuesGrid');
const loader = document.getElementById('loader');
const issueCount = document.getElementById('issueCount');
const tabBtns = document.querySelectorAll('.tab-btn');
const searchInput = document.getElementById('searchInput');
const issueModal = document.getElementById('issueModal');
const modalContent = document.getElementById('modalContent');

let allIssuesData = []; 


async function fetchIssues() {
    try {
        const response = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues');
        const result = await response.json();
        
        
        const actualIssuesArray = result && result.data ? result.data : [];
        allIssuesData = actualIssuesArray; 
        renderIssues(allIssuesData); 
    } catch (error) {
        console.error("Fetch all error:", error);
        issuesGrid.innerHTML = `<p class="text-red-500 col-span-4 text-center py-10">Failed to load issues.</p>`;
    } finally {
        loader.classList.add('hidden');
        issuesGrid.classList.remove('hidden');
    }
}


function getLabelHTML(label) {
    let colorClass = "text-gray-600 border-gray-200 bg-gray-50"; 
    const text = (label || '').toLowerCase();
    
    if(text.includes('bug')) {
        colorClass = "text-[#EB5757] border-[#EB5757]/30 bg-[#EB5757]/10";
    } else if(text.includes('help')) {
        colorClass = "text-[#F2C94C] border-[#F2C94C]/50 bg-[#F2C94C]/10";
    } else if(text.includes('enhancement')) {
        colorClass = "text-[#219653] border-[#219653]/30 bg-[#219653]/10";
    }

    return `<span class="text-[10px] font-bold border uppercase ${colorClass} px-2.5 py-1 rounded-md flex items-center gap-1">
                ${text.includes('bug') ? '<span class="w-1.5 h-1.5 rounded-full bg-[#EB5757]"></span>' : ''}
                ${label}
            </span>`;
}


function getPriorityHTML(priority) {
    const text = (priority || 'Normal').toLowerCase();
    let bgClass = "bg-gray-100 text-gray-500";
    
    if(text === 'high') bgClass = "bg-red-50 text-red-500";
    else if(text === 'medium') bgClass = "bg-yellow-50 text-yellow-600";

    return `<span class="text-[10px] font-bold px-3 py-1 rounded-full ${bgClass} uppercase tracking-wide border border-gray-100">${priority || 'Normal'}</span>`;
}


function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}



function renderIssues(issues) {
    issuesGrid.innerHTML = ''; 
    issueCount.innerText = issues.length; 

    issues.forEach(issue => {
        if (!issue) return;
        const isStatusOpen = issue.status && issue.status.toLowerCase() === 'open';
        

        const borderTopColor = isStatusOpen ? 'border-t-[#219653]' : 'border-t-[#8000FF]';
        const statusIcon = isStatusOpen ? 'assets/Open-Status.png' : 'assets/Closed-Status.png';
        
        const cardHTML = `
            <div class="bg-white p-5 rounded-xl border border-gray-200 border-t-4 ${borderTopColor} cursor-pointer hover:shadow-lg transition duration-200 flex flex-col h-full" onclick="openModal(${issue.id})">
                
                <div class="flex justify-between items-start mb-4">
                    <img src="${statusIcon}" alt="${issue.status}" class="w-5 h-5">
                    ${getPriorityHTML(issue.priority)}
                </div>

                <h3 class="font-bold text-sm text-gray-800 mb-2 line-clamp-2 leading-snug">${issue.title || "Untitled Issue"}</h3>
                <p class="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">${issue.description || "No description provided."}</p>
                
                <div class="flex flex-wrap gap-2 mb-6">
                    ${issue.labels ? issue.labels.map(label => getLabelHTML(label)).join('') : ''}
                </div>
                
                <div class="text-[11px] text-gray-400 mt-auto border-t border-gray-100 pt-3 flex justify-between">
                    <span>#${issue.id} by ${issue.author}</span>
                    <span>${formatDate(issue.createdAt)}</span>
                </div>
            </div>
        `;
        issuesGrid.innerHTML += cardHTML;
    });
}


tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        tabBtns.forEach(b => {
            b.classList.remove('bg-[#4F46E5]', 'text-white');
            b.classList.add('text-gray-600', 'hover:bg-gray-100', 'bg-transparent');
        });
        
        e.target.classList.add('bg-[#4F46E5]', 'text-white');
        e.target.classList.remove('text-gray-600', 'hover:bg-gray-100', 'bg-transparent');

        const filterType = e.target.getAttribute('data-filter');
        if (filterType === 'All') {
            renderIssues(allIssuesData);
        } else {
            const filteredData = allIssuesData.filter(issue => issue.status && issue.status.toLowerCase() === filterType.toLowerCase());
            renderIssues(filteredData);
        }
    });
});