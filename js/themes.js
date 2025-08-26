class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        this.loadTheme();
        this.setupEventListeners();
        this.applyTheme(this.currentTheme);
    }

    setupEventListeners() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.switchTheme(theme);
            });
        });
    }

    switchTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            this.currentTheme = theme;
            this.applyTheme(theme);
            this.saveTheme();
            this.updateActiveButton(theme);
        }
    }

    applyTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        this.updateThemeColor(theme);
    }

    updateThemeColor(theme) {
        const themeColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';
        const metaTag = document.querySelector('meta[name="theme-color"]');
        if (metaTag) {
            metaTag.setAttribute('content', themeColor);
        }
    }

    updateActiveButton(theme) {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });
    }

    saveTheme() {
        localStorage.setItem('preferredTheme', this.currentTheme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('preferredTheme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            this.currentTheme = prefersDark ? 'dark' : 'light';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});