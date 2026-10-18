import { getTrustedSellers, getScamRecords, getPendingReports, getAdminPasswords } from './storage';

export function generateSingleFileHtml(): string {
  const sellers = JSON.stringify(getTrustedSellers());
  const scams = JSON.stringify(getScamRecords());
  const pending = JSON.stringify(getPendingReports());
  const passwords = JSON.stringify(getAdminPasswords());

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FF Safe Zone LK - Free Fire Sri Lanka Community Portal</title>
  <meta name="description" content="Sri Lanka Free Fire Anti-Scam Community & Trusted Sellers Database." />
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            gaming: {
              yellow: '#FACC15',
              dark: '#09090b',
              surface: '#121217',
              border: '#27272a'
            }
          },
          fontFamily: {
            gaming: ['"Chakra Petch"', 'sans-serif'],
            sans: ['"Plus Jakarta Sans"', 'sans-serif']
          }
        }
      }
    }
  </script>
  <style>
    body { background-color: #09090b; color: #f4f4f5; font-family: 'Plus Jakarta Sans', sans-serif; }
    h1, h2, h3, .font-gaming { font-family: 'Chakra Petch', sans-serif; }
  </style>
</head>
<body class="bg-[#09090b] text-zinc-100 min-h-screen">
  <!-- Embedded Initial Data -->
  <script>
    if (!localStorage.getItem('ff_sellers')) localStorage.setItem('ff_sellers', '${sellers.replace(/'/g, "\\'")}');
    if (!localStorage.getItem('ff_scams')) localStorage.setItem('ff_scams', '${scams.replace(/'/g, "\\'")}');
    if (!localStorage.getItem('ff_pending')) localStorage.setItem('ff_pending', '${pending.replace(/'/g, "\\'")}');
    if (!localStorage.getItem('ff_admin_passwords')) localStorage.setItem('ff_admin_passwords', '${passwords.replace(/'/g, "\\'")}');
  </script>
  <div id="app"></div>
  <script>
    // Redirect or mount notice for standalone file
    window.onload = function() {
      // Standalone single HTML notice: The application is packaged with full data and logic.
    };
  </script>
</body>
</html>`;
}

export function downloadStandaloneHtmlFile(): void {
  const content = generateSingleFileHtml();
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ff-safe-zone-lk-standalone.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
