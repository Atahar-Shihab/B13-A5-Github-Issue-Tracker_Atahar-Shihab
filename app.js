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
