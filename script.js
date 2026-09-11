document.addEventListener("DOMContentLoaded", async () => {
    const videoElement = document.getElementById("meuVideo");
    const playBtn = document.getElementById("playBtn");
    const container = document.getElementById("videoContainer");
    const animIndicator = document.getElementById("animIndicator");
    const iconShape = document.getElementById("iconShape");

    let hideTimeout;

    try {
        const response = await fetch("config.json");
        const data = await response.json();
        videoElement.src = data.videoFileName;
        
        // Garante que começa mutado para passar pelas restrições do navegador
        videoElement.muted = true;
        videoElement.load();

        async function ativarModoImersivo() {
            try {
                if (container.requestFullscreen) {
                    await container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                }

                if (screen.orientation && screen.orientation.lock) {
                    await screen.orientation.lock("landscape").catch(() => {});
                }
            } catch (err) {
                console.log("Modo tela cheia requer toque do usuário.");
            }
        }

        // Exibe o botão de início explicitamente para o usuário interagir e liberar o som/tela cheia
        playBtn.style.display = "block";

        // Ação ao clicar no botão de início
        playBtn.addEventListener("click", async () => {
            await ativarModoImersivo();
            
            // Ativa o som e inicia o vídeo com interação real do usuário
            videoElement.muted = false;
            let playPromise = videoElement.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    playBtn.style.display = "none";
                }).catch(err => {
                    console.error("Erro ao reproduzir:", err);
                });
            }
        });

        // Pausar / Despausar ao tocar na tela com animações diferentes
        container.addEventListener("click", (e) => {
            // Se clicar no botão ou o botão estiver visível, não interfere
            if (e.target === playBtn || playBtn.style.display === "block") return;

            if (videoElement.paused) {
                videoElement.play();
                mostrarAnimacao("play");
            } else {
                videoElement.pause();
                mostrarAnimacao("pause");
            }
        });

        function mostrarAnimacao(estado) {
            iconShape.className = "icon-shape " + estado;
            animIndicator.classList.add("show");

            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                animIndicator.classList.remove("show");
            }, 700);
        }

        // Se sair da tela cheia, o botão reaparece e pausa o vídeo
        document.addEventListener("fullscreenchange", () => {
            if (!document.fullscreenElement) {
                playBtn.style.display = "block";
                videoElement.pause();
            }
        });

    } catch (error) {
        console.error("Erro geral no script:", error);
        playBtn.style.display = "block";
    }
});
