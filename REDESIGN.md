<!-- Kindred Home Screen -->
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Kindred - Home</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&amp;family=Outfit:wght@300;400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#9DBEBB", // Soft Sage
                        secondary: "#F4ACB7", // Soft Rose
                        accent: "#FFE5D9", // Creamy Peach
                        "background-light": "#F9FBFA",
                        "background-dark": "#121414",
                    },
                    fontFamily: {
                        display: ["Quicksand", "sans-serif"],
                        body: ["Outfit", "sans-serif"],
                    },
                    borderRadius: {
                        DEFAULT: "24px",
                        'xl': '32px',
                        '2xl': '40px',
                    },
                },
            },
        };
    </script>
<style>
        body {
            font-family: 'Outfit', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        h1, h2, h3 {
            font-family: 'Quicksand', sans-serif;
        }
        .quilt-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        .quilt-tile-large {
            grid-row: span 2;
        }
        .soft-shadow {
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 min-h-screen">
<div class="h-12 w-full"></div>
<main class="px-6 pb-32">
<header class="flex justify-between items-center mb-8">
<div>
<p class="text-sm font-medium opacity-60 dark:opacity-50">Good morning, Sarah</p>
<h1 class="text-3xl font-bold tracking-tight mt-1">Kindred</h1>
</div>
<div class="relative">
<div class="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 soft-shadow">
<img alt="User Profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3IgMSgQp-7xH59t5_dzWnv7xGmmh52MEGggLIDf7U2vcidpBfG9QpxWT08jLKQEuJ3oJEk83xbg3KugSH0wGwjSe8JVce5TTA7cG-Zo7rQMGxub3rNnUTvZD_5iC64UUWf8_mW6BR9W0DVmqujZ-6DBF9HgyhkP7eVNrKIY1SkTMx0gUpdIkKOnRt7MbIbr1XV7kF2Vt05C0Rn2SUB22Lyv62wUyayQrErNBWoaAm5_lX_4pN1eCCOkwt2HJAMbGWhhOY39AFaQ"/>
</div>
<div class="absolute -top-1 -right-1 w-4 h-4 bg-secondary border-2 border-background-light dark:border-background-dark rounded-full"></div>
</div>
</header>
<section class="mb-10">
<div class="bg-primary/10 dark:bg-primary/20 p-6 rounded-2xl relative overflow-hidden">
<div class="relative z-10">
<h2 class="text-lg font-semibold mb-2 flex items-center gap-2">
<span class="material-symbols-rounded text-primary">auto_awesome</span>
                        Daily Softness
                    </h2>
<p class="text-sm leading-relaxed opacity-80 mb-4">
                        "Real connection isn't about how often you talk, but how deeply you listen."
                    </p>
<button class="bg-white/80 dark:bg-slate-800/80 backdrop-blur px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2">
                        Reflect <span class="material-symbols-rounded text-base">arrow_forward</span>
</button>
</div>
<div class="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
</div>
</section>
<section>
<div class="flex justify-between items-end mb-6">
<div>
<h2 class="text-2xl font-bold">Your connections</h2>
<p class="text-xs opacity-50 font-medium">Nurturing your inner circle</p>
</div>
<button class="text-primary text-sm font-semibold flex items-center gap-1">
                    See all
                </button>
</div>
<div class="quilt-grid">
<div class="quilt-tile-large bg-secondary/15 dark:bg-secondary/20 p-5 rounded-3xl flex flex-col justify-between border border-secondary/20">
<div class="flex justify-between items-start">
<div class="w-10 h-10 rounded-2xl bg-secondary/30 flex items-center justify-center">
<span class="material-symbols-rounded text-secondary">favorite</span>
</div>
<span class="text-[10px] font-bold uppercase tracking-wider text-secondary/70">Wife</span>
</div>
<div>
<h3 class="text-xl font-bold">Emma</h3>
<p class="text-xs opacity-60 mt-1">Connected recently</p>
<div class="mt-4 flex -space-x-2">
<div class="w-6 h-6 rounded-full bg-white dark:bg-slate-700 border-2 border-secondary/10 flex items-center justify-center text-[10px]">✨</div>
<div class="w-6 h-6 rounded-full bg-white dark:bg-slate-700 border-2 border-secondary/10 flex items-center justify-center text-[10px]">🌿</div>
</div>
</div>
</div>
<div class="bg-primary/15 dark:bg-primary/20 p-5 rounded-3xl flex flex-col justify-between border border-primary/20">
<div class="w-8 h-8 rounded-xl bg-primary/30 flex items-center justify-center mb-3">
<span class="material-symbols-rounded text-primary text-sm">home</span>
</div>
<div>
<h3 class="text-base font-bold">Dad</h3>
<p class="text-[10px] opacity-60">A gentle reminder is coming up</p>
</div>
</div>
<div class="bg-accent/40 dark:bg-accent/10 p-5 rounded-3xl flex flex-col justify-between border border-accent/60">
<div class="w-8 h-8 rounded-xl bg-accent/80 dark:bg-accent/20 flex items-center justify-center mb-3">
<span class="material-symbols-rounded text-orange-400 text-sm">potted_plant</span>
</div>
<div>
<h3 class="text-base font-bold">Marcus</h3>
<p class="text-[10px] opacity-60">3 days since last talk</p>
</div>
</div>
<div class="col-span-2 bg-slate-100 dark:bg-slate-800/50 p-5 rounded-3xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center soft-shadow">
<span class="material-symbols-rounded text-slate-400">group</span>
</div>
<div>
<h3 class="text-base font-bold">The Brunch Group</h3>
<p class="text-xs opacity-60">Planning a gathering?</p>
</div>
</div>
<span class="material-symbols-rounded text-slate-400">chevron_right</span>
</div>
<button class="col-span-2 border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
<div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
<span class="material-symbols-rounded text-slate-400">add</span>
</div>
<span class="text-sm font-medium text-slate-500">Add a connection</span>
</button>
</div>
</section>
</main>
<nav class="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-8 pt-4 pb-8 z-50">
<div class="max-w-md mx-auto flex justify-between items-center">
<button class="flex flex-col items-center gap-1 text-primary">
<span class="material-symbols-rounded fill-1">home</span>
<span class="text-[10px] font-bold">Home</span>
</button>
<button class="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
<span class="material-symbols-rounded">calendar_today</span>
<span class="text-[10px] font-medium">Moments</span>
</button>
<button class="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
<span class="material-symbols-rounded">auto_stories</span>
<span class="text-[10px] font-medium">Journal</span>
</button>
<button class="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
<span class="material-symbols-rounded">settings</span>
<span class="text-[10px] font-medium">Growth</span>
</button>
</div>
<div class="h-4"></div>
</nav>
<div class="fixed bottom-24 right-6 z-40">
<button class="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
<span class="material-symbols-rounded text-2xl">heart_plus</span>
</button>
</div>
<script>
        // Simple script to toggle dark mode for previewing (optional)
        // Usage: type toggleDarkMode() in console
        function toggleDarkMode() {
            document.documentElement.classList.toggle('dark');
        }
    </script>

</body></html>

<!-- Add Connection Screen -->
<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Kindred - Add Connection</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&amp;family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet"/>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#A7D7C5", // Soft sage green from the "Calm" theme in screenshot
                        "background-light": "#F8F9FA",
                        "background-dark": "#121212",
                        accent: {
                            pink: "#FFD6E8",
                            blue: "#D1F2FB",
                            yellow: "#FFF4CC"
                        }
                    },
                    fontFamily: {
                        display: ["Outfit", "sans-serif"],
                        body: ["Plus Jakarta Sans", "sans-serif"],
                    },
                    borderRadius: {
                        DEFAULT: "24px",
                        'xl': '32px',
                        '2xl': '40px',
                    },
                },
            },
        };
    </script>
<style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .font-display {
            font-family: 'Outfit', sans-serif;
        }.hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .ios-shadow {
            box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex justify-center items-center p-4">
<div class="w-full max-w-[393px] h-[852px] bg-white dark:bg-[#1C1C1E] rounded-[55px] overflow-hidden shadow-2xl border-[8px] border-slate-900 dark:border-slate-800 relative flex flex-col">
<div class="h-12 flex items-center justify-between px-8 pt-4">
<span class="text-sm font-semibold">9:41</span>
<div class="flex items-center gap-1.5">
<span class="material-symbols-rounded text-base">signal_cellular_4_bar</span>
<span class="material-symbols-rounded text-base">wifi</span>
<span class="material-symbols-rounded text-base rotate-90">battery_full</span>
</div>
</div>
<div class="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-black rounded-full"></div>
<main class="flex-1 px-8 pt-8 flex flex-col">
<header class="flex items-center justify-between mb-8">
<button class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
<span class="material-symbols-rounded">arrow_back_ios_new</span>
</button>
<div class="flex gap-1.5">
<div class="w-8 h-1.5 rounded-full bg-primary"></div>
<div class="w-8 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
<div class="w-8 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
</div>
<div class="w-10"></div> 
</header>
<div class="flex-1 overflow-y-auto hide-scrollbar pb-24">
<h1 class="font-display text-4xl font-semibold mb-3 tracking-tight">Add a connection</h1>
<p class="text-slate-500 dark:text-slate-400 text-lg leading-relaxed mb-10">
                    Every relationship has its own rhythm. Let’s set one that feels right.
                </p>
<div class="space-y-10">
<div class="space-y-4">
<label class="block text-sm font-medium text-slate-400 uppercase tracking-widest ml-1" for="name">
                            Who would you like to stay connected with?
                        </label>
<input class="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-5 px-6 text-xl font-medium focus:ring-2 focus:ring-primary placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all duration-300" id="name" placeholder="Type a name..." type="text"/>
</div>
<div class="space-y-4">
<label class="block text-sm font-medium text-slate-400 uppercase tracking-widest ml-1">
                            Relationship Type
                        </label>
<div class="flex flex-wrap gap-3">
<button class="px-5 py-3 rounded-full border-2 border-primary bg-primary/10 text-slate-900 dark:text-white font-medium transition-all active:scale-95">
                                Friend
                            </button>
<button class="px-5 py-3 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:border-primary/50 transition-all active:scale-95">
                                Family
                            </button>
<button class="px-5 py-3 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:border-primary/50 transition-all active:scale-95">
                                Chosen family
                            </button>
<button class="px-5 py-3 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:border-primary/50 transition-all active:scale-95">
                                Mentor
                            </button>
<button class="px-5 py-3 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:border-primary/50 transition-all active:scale-95">
                                Other
                            </button>
</div>
</div>
</div>
<div class="mt-12 grid grid-cols-2 gap-4 opacity-40">
<div class="h-24 bg-accent-pink/30 dark:bg-accent-pink/10 rounded-3xl border-2 border-dashed border-accent-pink"></div>
<div class="h-24 bg-primary/20 dark:bg-primary/5 rounded-3xl overflow-hidden relative">
<div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0); background-size: 12px 12px;"></div>
</div>
</div>
</div>
</main>
<div class="absolute bottom-0 left-0 right-0 p-8 pt-4 pb-12 bg-gradient-to-t from-white via-white to-transparent dark:from-[#1C1C1E] dark:via-[#1C1C1E] dark:to-transparent">
<div class="flex items-center gap-4">
<button class="flex-1 py-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold transition-transform active:scale-95">
                    Skip
                </button>
<button class="flex-[2] py-5 rounded-full bg-primary text-slate-900 font-bold flex items-center justify-center gap-2 ios-shadow transition-transform active:scale-[0.98]">
                    Next
                    <span class="material-symbols-rounded text-xl">arrow_forward</span>
</button>
</div>
</div>
<div class="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
</div>

</body></html>

<!-- Connection Detail View -->
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Kindred - Connection Detail</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet"/>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#A7F3D0", // Soft Mint
                        secondary: "#FBCFE8", // Soft Pink
                        accent: "#BAE6FD", // Soft Blue
                        "background-light": "#FAF9F6", // Warm Paper
                        "background-dark": "#121212",
                    },
                    fontFamily: {
                        display: ["Plus Jakarta Sans", "sans-serif"],
                    },
                    borderRadius: {
                        DEFAULT: "24px",
                    },
                },
            },
        };
    </script>
<style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        .quilt-card {
            box-shadow: 0 4px 20px -2px rgba(0,0,0,0.05);
        }
        .ios-blur {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex justify-center">
<div class="w-full max-w-[430px] bg-background-light dark:bg-background-dark min-h-screen relative overflow-hidden flex flex-col">
<div class="flex justify-between items-center px-8 pt-12 pb-4">
<span class="text-sm font-semibold">9:41</span>
<div class="flex gap-1.5 items-center">
<span class="material-icons-outlined text-sm">signal_cellular_alt</span>
<span class="material-icons-outlined text-sm">wifi</span>
<span class="material-icons-outlined text-sm">battery_full</span>
</div>
</div>
<header class="px-6 flex items-center justify-between">
<button class="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 shadow-sm border border-slate-100 dark:border-neutral-700">
<span class="material-icons-outlined">chevron_left</span>
</button>
<div class="text-center">
<h1 class="text-lg font-bold tracking-tight">Maya</h1>
<p class="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest">Friend</p>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-neutral-800 shadow-sm border border-slate-100 dark:border-neutral-700">
<span class="material-icons-outlined">more_horiz</span>
</button>
</header>
<main class="flex-1 overflow-y-auto px-6 pt-8 pb-32 space-y-8">
<section class="text-center space-y-4">
<div class="relative inline-block">
<div class="w-32 h-32 rounded-full border-4 border-primary/30 p-1.5">
<img alt="Maya's Profile" class="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrKWzVDs8pcOLfPI955fqV4TUqtN6wKraCVgweVZK_K3CST_pyMniufKreRI-PwxfloQOoBHG7s-5L8dIJhEYha1ji4UpJCOLNPWym5ZlzAGL72NeoijRmlb4ZLqYTKSqyukierc_HVfDo24cNU34V3Thfxrn5KYYVTRAEq21Z4wkckepHU0BGXF9Ul_oHhbX2UZMh3QSCultYgpgOSxzAWPzR5RjVF1TRPSmDkOWmKjPeiOI5SzUiz_hr32CzjvH9lyef7YNwiQ"/>
</div>
<div class="absolute bottom-1 right-1 bg-white dark:bg-neutral-800 p-1.5 rounded-full shadow-md">
<span class="material-icons-outlined text-primary text-xl">favorite</span>
</div>
</div>
<div>
<p class="text-sm text-slate-500 dark:text-slate-400">Last connected in March</p>
</div>
</section>
<section class="bg-white dark:bg-neutral-800 p-6 rounded-[32px] quilt-card border border-slate-50 dark:border-neutral-700">
<div class="flex items-center gap-2 mb-3">
<span class="material-icons-outlined text-amber-400 text-lg">auto_awesome</span>
<h3 class="text-sm font-semibold uppercase tracking-wider text-slate-400">Notes</h3>
</div>
<textarea class="w-full bg-transparent border-none p-0 focus:ring-0 text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-neutral-600 text-lg leading-relaxed resize-none h-24" placeholder="What matters to you about this connection?"></textarea>
</section>
<section class="grid grid-cols-2 gap-4">
<button class="bg-secondary/20 dark:bg-pink-900/30 p-6 rounded-[28px] flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 group">
<div class="w-12 h-12 rounded-2xl bg-secondary dark:bg-pink-400 flex items-center justify-center text-white">
<span class="material-icons-outlined">call</span>
</div>
<span class="font-semibold text-pink-600 dark:text-pink-300">Call</span>
</button>
<button class="bg-primary/20 dark:bg-emerald-900/30 p-6 rounded-[28px] flex flex-col items-center justify-center gap-3 transition-transform active:scale-95">
<div class="w-12 h-12 rounded-2xl bg-primary dark:bg-emerald-400 flex items-center justify-center text-slate-800">
<span class="material-icons-outlined">chat_bubble_outline</span>
</div>
<span class="font-semibold text-emerald-600 dark:text-emerald-300">Text</span>
</button>
<button class="bg-accent/20 dark:bg-sky-900/30 p-6 rounded-[28px] flex flex-col items-center justify-center gap-3 transition-transform active:scale-95">
<div class="w-12 h-12 rounded-2xl bg-accent dark:bg-sky-400 flex items-center justify-center text-slate-800">
<span class="material-icons-outlined">mic</span>
</div>
<span class="font-semibold text-sky-600 dark:text-sky-300">Voice Note</span>
</button>
<button class="bg-slate-100 dark:bg-neutral-800 p-6 rounded-[28px] flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 border border-slate-200/50 dark:border-neutral-700">
<div class="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-700 flex items-center justify-center text-slate-400">
<span class="material-icons-outlined">edit_note</span>
</div>
<span class="font-semibold text-slate-500 dark:text-slate-400">Write Later</span>
</button>
</section>
<section class="space-y-4">
<div class="flex items-center justify-between px-2">
<h3 class="text-lg font-bold">Shared moments</h3>
<button class="text-sm font-semibold text-primary/80">View all</button>
</div>
<div class="space-y-3">
<div class="bg-white dark:bg-neutral-800 p-4 rounded-3xl flex items-center gap-4 border border-slate-50 dark:border-neutral-700 quilt-card">
<div class="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 overflow-hidden shrink-0">
<img alt="Memory" class="w-full h-full object-cover opacity-80" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_QwoDdew5C02tRUsSLhQLZbCT2l64ocmv_uP7tQlWr1q7s4zYYDYWpl0rcUEq42KdixZW65ox3eEJNnBStfnnkel9Dy_wjRk26DJs9_c2-QgSpFQJKqnIvlm3JYtdRcw6gdg1Nrt5ISuBcXsHfIebKYmT0di-PmdYls_8YIHC7ePk9_NFTCcqM05ZX_-d5t-MMpfIApD4KD-JMeK3Jq294PQRvw-rcheM5TESIu8xj81TMPUMOF-fPYfH060i3hxORUMNQQWf-A"/>
</div>
<div class="flex-1 min-w-0">
<h4 class="font-semibold truncate">Coffee at The Nook</h4>
<p class="text-xs text-slate-500 dark:text-slate-400">March 14 • Gentle conversation</p>
</div>
<span class="material-icons-outlined text-slate-300">chevron_right</span>
</div>
<div class="bg-white dark:bg-neutral-800 p-4 rounded-3xl flex items-center gap-4 border border-slate-50 dark:border-neutral-700 quilt-card">
<div class="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
<span class="material-icons-outlined text-emerald-300 text-3xl">park</span>
</div>
<div class="flex-1 min-w-0">
<h4 class="font-semibold truncate">Walk in Central Park</h4>
<p class="text-xs text-slate-500 dark:text-slate-400">Feb 28 • Sunny afternoon</p>
</div>
<span class="material-icons-outlined text-slate-300">chevron_right</span>
</div>
</div>
</section>
</main>
<nav class="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] ios-blur bg-white/70 dark:bg-neutral-900/70 border border-white/20 dark:border-white/10 rounded-full h-16 flex items-center justify-around px-4 shadow-2xl">
<button class="p-2 text-primary">
<span class="material-icons-outlined">home</span>
</button>
<button class="p-2 text-slate-400">
<span class="material-icons-outlined">people</span>
</button>
<button class="w-12 h-12 rounded-full bg-primary text-slate-800 shadow-lg shadow-primary/30 flex items-center justify-center -mt-8">
<span class="material-icons-outlined">add</span>
</button>
<button class="p-2 text-slate-400">
<span class="material-icons-outlined">calendar_today</span>
</button>
<button class="p-2 text-slate-400">
<span class="material-icons-outlined">person</span>
</button>
</nav>
<div class="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-full"></div>
</div>
<div class="fixed top-4 right-4 flex gap-2">
<button class="w-10 h-10 bg-slate-200 dark:bg-neutral-700 rounded-full flex items-center justify-center shadow-lg" onclick="document.documentElement.classList.toggle('dark')">
<span class="material-icons-outlined text-slate-600 dark:text-slate-300">dark_mode</span>
</button>
</div>

        Landing page ALT
</body></html>
<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Kindred - Home</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&amp;family=Outfit:wght@300;400;500;600&amp;family=Fraunces:opsz,wght@9..144,400;600&amp;family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#8E9B97", // Muted Sage
                        secondary: "#D4A3A1", // Muted Dusty Rose
                        accent: "#E5D9D0", // Muted Linen
                        "brand-navy": "#363D4D", // Sophisticated Deep Slate
                        "background-light": "#F7F6F4",
                        "background-dark": "#1A1C1E",
                    },
                    fontFamily: {
                        display: ["Quicksand", "sans-serif"],
                        body: ["Outfit", "sans-serif"],
                        serif: ["Libre Baskerville", "serif"],
                        fraunces: ["Fraunces", "serif"],
                    },
                    borderRadius: {
                        DEFAULT: "20px",
                        'xl': '28px',
                        '2xl': '36px',
                    },
                },
            },
        };
    </script>
<style type="text/tailwindcss">
        body {
            font-family: 'Outfit', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        h1, h2, h3 {
            font-family: 'Quicksand', sans-serif;
        }
        .quilt-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        .quilt-tile-large {
            grid-row: span 2;
        }
        .soft-shadow {
            box-shadow: 0 10px 30px -8px rgba(0, 0, 0, 0.04);
        }.quilt-square-logo {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            width: 32px;
            height: 32px;
            overflow: hidden;
            border-radius: 6px;
            transform: rotate(0deg);
        }
        .patch {
            width: 100%;
            height: 100%;
        }
        .patch-1 { background-color: #8E9B97; }.patch-2 { background-color: #D4A3A1; }.patch-3 { background-color: #B2B9C5; }.patch-4 { background-color: #E5D9D0; }</style>
<style>
        body {
            min-height: max(884px, 100dvh);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-700 dark:text-slate-200 min-h-screen">
<div class="h-12 w-full"></div>
<main class="px-6 pb-32">
<header class="flex justify-between items-start mb-8">
<div class="flex flex-col gap-3">
<div class="flex items-center gap-3">
<div class="quilt-square-logo">
<div class="patch patch-1"></div>
<div class="patch patch-2"></div>
<div class="patch patch-3"></div>
<div class="patch patch-4"></div>
</div>
<span class="text-2xl font-serif tracking-tight text-brand-navy dark:text-slate-200 leading-none">Kindred</span>
</div>
<p class="text-sm font-medium opacity-50 dark:opacity-40">Good morning, Sarah</p>
</div>
<div class="relative">
<div class="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 soft-shadow">
<img alt="User Profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3IgMSgQp-7xH59t5_dzWnv7xGmmh52MEGggLIDf7U2vcidpBfG9QpxWT08jLKQEuJ3oJEk83xbg3KugSH0wGwjSe8JVce5TTA7cG-Zo7rQMGxub3rNnUTvZD_5iC64UUWf8_mW6BR9W0DVmqujZ-6DBF9HgyhkP7eVNrKIY1SkTMx0gUpdIkKOnRt7MbIbr1XV7kF2Vt05C0Rn2SUB22Lyv62wUyayQrErNBWoaAm5_lX_4pN1eCCOkwt2HJAMbGWhhOY39AFaQ"/>
</div>
<div class="absolute -top-1 -right-1 w-4 h-4 bg-secondary border-2 border-background-light dark:border-background-dark rounded-full"></div>
</div>
</header>
<section class="mb-10">
<div class="bg-primary/10 dark:bg-primary/20 p-6 rounded-2xl relative overflow-hidden border border-primary/5">
<div class="relative z-10">
<h2 class="text-lg font-semibold mb-2 flex items-center gap-2 text-brand-navy dark:text-slate-200">
<span class="material-symbols-rounded text-primary">auto_awesome</span>
                    Daily Softness
                </h2>
<p class="text-sm leading-relaxed opacity-70 mb-4 font-fraunces italic">
                    "Real connection isn't about how often you talk, but how deeply you listen."
                </p>
<button class="bg-white/90 dark:bg-slate-800/80 backdrop-blur px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-sm">
                    Reflect <span class="material-symbols-rounded text-base">arrow_forward</span>
</button>
</div>
<div class="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
</div>
</section>
<section>
<div class="flex justify-between items-end mb-6">
<div>
<h2 class="text-2xl font-bold text-brand-navy dark:text-slate-100">Your connections</h2>
<p class="text-xs opacity-40 font-medium">Nurturing your inner circle</p>
</div>
<button class="text-primary text-sm font-semibold flex items-center gap-1">
                See all
            </button>
</div>
<div class="quilt-grid">
<div class="quilt-tile-large bg-secondary/10 dark:bg-secondary/20 p-5 rounded-3xl flex flex-col justify-between border border-secondary/20">
<div class="flex justify-between items-start">
<div class="w-10 h-10 rounded-2xl bg-secondary/20 flex items-center justify-center">
<span class="material-symbols-rounded text-secondary">favorite</span>
</div>
<span class="text-[10px] font-bold uppercase tracking-wider text-secondary/70">Partner</span>
</div>
<div>
<h3 class="text-xl font-bold text-brand-navy dark:text-slate-200">Emma</h3>
<p class="text-xs opacity-50 mt-1">Connected recently</p>
<div class="mt-4 flex -space-x-2">
<div class="w-6 h-6 rounded-full bg-white dark:bg-slate-700 border border-secondary/10 flex items-center justify-center text-[10px]">✨</div>
<div class="w-6 h-6 rounded-full bg-white dark:bg-slate-700 border border-secondary/10 flex items-center justify-center text-[10px]">🌿</div>
</div>
</div>
</div>
<div class="bg-primary/10 dark:bg-primary/20 p-5 rounded-3xl flex flex-col justify-between border border-primary/20">
<div class="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center mb-3">
<span class="material-symbols-rounded text-primary text-sm">home</span>
</div>
<div>
<h3 class="text-base font-bold text-brand-navy dark:text-slate-200">Dad</h3>
<p class="text-[10px] opacity-50">A gentle reminder is coming up</p>
</div>
</div>
<div class="bg-accent/40 dark:bg-accent/10 p-5 rounded-3xl flex flex-col justify-between border border-accent/60">
<div class="w-8 h-8 rounded-xl bg-white/60 dark:bg-accent/20 flex items-center justify-center mb-3">
<span class="material-symbols-rounded text-primary text-sm">potted_plant</span>
</div>
<div>
<h3 class="text-base font-bold text-brand-navy dark:text-slate-200">Marcus</h3>
<p class="text-[10px] opacity-50">3 days since last talk</p>
</div>
</div>
<div class="col-span-2 bg-slate-100 dark:bg-slate-800/50 p-5 rounded-3xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
<div class="flex items-center gap-4">
<div class="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center soft-shadow">
<span class="material-symbols-rounded text-slate-400">group</span>
</div>
<div>
<h3 class="text-base font-bold text-brand-navy dark:text-slate-200">The Brunch Group</h3>
<p class="text-xs opacity-50">Planning a gathering?</p>
</div>
</div>
<span class="material-symbols-rounded text-slate-400">chevron_right</span>
</div>
<button class="col-span-2 border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
<div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
<span class="material-symbols-rounded text-slate-400">add</span>
</div>
<span class="text-sm font-medium text-slate-400">Add a connection</span>
</button>
</div>
</section>
</main>
<nav class="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 px-8 pt-4 pb-8 z-50">
<div class="max-w-md mx-auto flex justify-between items-center">
<button class="flex flex-col items-center gap-1 text-primary">
<span class="material-symbols-rounded fill-1">home</span>
<span class="text-[10px] font-bold">Home</span>
</button>
<button class="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
<span class="material-symbols-rounded">calendar_today</span>
<span class="text-[10px] font-medium">Moments</span>
</button>
<button class="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
<span class="material-symbols-rounded">auto_stories</span>
<span class="text-[10px] font-medium">Journal</span>
</button>
<button class="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
<span class="material-symbols-rounded">settings</span>
<span class="text-[10px] font-medium">Growth</span>
</button>
</div>
<div class="h-4"></div>
</nav>
<div class="fixed bottom-24 right-6 z-40">
<button class="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/20 flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
<span class="material-symbols-rounded text-2xl">heart_plus</span>
</button>
</div>

</body></html>
