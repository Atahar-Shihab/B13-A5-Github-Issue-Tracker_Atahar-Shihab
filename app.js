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


searchInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (!query) {
            renderIssues(allIssuesData); 
            return;
        }

        loader.classList.remove('hidden');
        issuesGrid.classList.add('hidden');

        try {
            const response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${query}`);
            const result = await response.json();
            const actualSearchArray = result && result.data ? result.data : [];
            renderIssues(actualSearchArray);
        } catch (error) {
            console.error("Search error:", error);
            issuesGrid.innerHTML = `<p class="text-red-500 col-span-4 text-center py-10">Search failed.</p>`;
        } finally {
            loader.classList.add('hidden');
            issuesGrid.classList.remove('hidden');
        }
    }
});


async function openModal(id) {
    if (!id) return;
    issueModal.classList.remove('hidden');

    modalContent.innerHTML = `
        <div class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#4F46E5]"></div>
        </div>
    `;

    try {
        const response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
        const result = await response.json();

   
        const issue = result.data;

        if (!issue) {
            modalContent.innerHTML = `<p class="text-red-500 py-10 text-center">Issue data not found.</p>`;
            return;
        }

        const isStatusOpen = issue.status && issue.status.toLowerCase() === 'open';
        const statusBgColor = isStatusOpen ? 'bg-[#219653]' : 'bg-[#8000FF]';
        
  
        modalContent.innerHTML = `
            <div class="bg-white">
                <h2 class="text-2xl font-bold text-gray-800 mb-4 leading-tight">${issue.title || "Untitled Issue"}</h2>
                
                <div class="flex flex-wrap items-center gap-2.5 text-xs text-gray-500 mb-6 font-medium">
                    <span class="${statusBgColor} text-white px-3 py-1 rounded-full font-semibold capitalize">${issue.status || "Unknown"}</span>
                    <span>•</span>
                    <span>Opened by <span class="font-semibold text-gray-800">${issue.author || "Unknown"}</span></span>
                    <span>•</span>
                    <span>${formatDate(issue.createdAt)}</span>
                </div>

                <div class="flex gap-2.5 mb-8">
                     ${issue.labels ? issue.labels.map(label => getLabelHTML(label)).join('') : ''}
                </div>
                
                <p class="text-gray-600 text-[13px] mb-10 leading-relaxed font-normal">${issue.description || "This issue has no description."}</p>
                
                <div class="bg-gray-50 p-6 rounded-xl flex gap-32 text-sm mb-6 border border-gray-100">
                    <div>
                        <p class="text-gray-500 mb-1.5 font-medium">Assignee:</p>
                        <p class="font-bold text-gray-900">${issue.assignee || 'Unassigned'}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 mb-1.5 font-medium">Priority:</p>
                        <span class="text-[10px] font-bold px-3.5 py-1.5 rounded-full ${issue.priority?.toLowerCase() === 'high' ? 'bg-[#EB5757] text-white' : 'bg-gray-200 text-gray-700'} uppercase tracking-wide">${issue.priority || 'Normal'}</span>
                    </div>
                </div>
                
                <div class="flex justify-end pt-4">
                    <button id="closeModalBtn" class="bg-[#4F46E5] text-white px-8 py-2.5 rounded-md font-bold text-sm hover:bg-[#3d36b8] transition">Close</button>
                </div>
            </div>
        `;

   
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            issueModal.classList.add('hidden');
        });

    } catch (error) {
        console.error("Fetch single issue error:", error);
        modalContent.innerHTML = `<p class="text-red-500 py-10 text-center font-medium">Failed to load issue details.</p>`;
    }
}


issueModal.addEventListener('click', (e) => {
    if (e.target === issueModal) {
        issueModal.classList.add('hidden');
    }
});


fetchIssues();