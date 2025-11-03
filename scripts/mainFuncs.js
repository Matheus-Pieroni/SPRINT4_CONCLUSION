function showSection(sectionName) {
    console.log("Trying to show section:", sectionName);
    
    // Hide all content sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
        console.log("Section shown:", sectionName);
    } else {
        console.error("Section not found:", sectionName + '-section');
    }
}

// Show main section by default when page loads
document.addEventListener('DOMContentLoaded', function() {
    showSection('main');
});