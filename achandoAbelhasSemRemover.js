const form = document.querySelector(".form-container")
const hideButton = document.querySelector(".hide-button")
const toggleButton = document.querySelector(".toggle-button button");
const formContent = document.querySelector(".form-content");
const findBees = document.querySelector(".find-bees");
const formClass = document.querySelector(".form-class")
const checkbox = document.querySelector(".checkbox")

const selectedBees = []

const allMelipon = [
    {
        name: 'Irai',
        img: "imgs/abelha-irai.jpg"
    },
    {
        name: 'Mandacaia',
        img: "imgs/abelha-mandacaia.jpg"
    },
    {
        name: 'Mandaguari Preta',
        img: "imgs/abelha-mandaguari-preta.jpg"
    },
    {
        name: 'Jatai',
        img: "imgs/Abelhas-Jatai.jpg"
    }
]

var customIcon = L.icon({
    className: 'custom-icon', // Add a class for styling

    iconUrl: 'imgs/bee-icon-map.png',
    iconSize: [35, 35],
    iconAnchor: [22, 22], // Centraliza melhor o ícone
    popupAnchor: [-4, -22] // Ajusta a posição do popup
});

// Add CSS styles for the custom icon
const style = document.createElement('style');
style.innerHTML = `
    .custom-icon  {
        filter: drop-shadow(0 0 2px white) drop-shadow(0 0 4px white); /* Add a blue glow/outline */
    }
    .custom-icon img {
        width: 100%;
        height: 100%;
    }
`;
document.head.appendChild(style);


fetch("beesGeo.json")
    .then(response => response.json())
    .then(data => {

        const geoJsonLayer = L.geoJSON(data, {
            pointToLayer: (feature, latlng) => L.marker(latlng, { icon: customIcon }),
            onEachFeature: (feature, layer) => {
                const { name, especie, local_nidificacao } = feature.properties;
                const findBeeImg = allMelipon.find(item => item.name.toLowerCase() === especie.toLowerCase());



                if (findBeeImg) {
                    layer.bindPopup(`
                        <div class="pop-up-bees">
                            <div>
                                <img class="bee-img" src="${findBeeImg.img}" alt="${name}">
                            </div>
                            <div class="descriptions">
                                <p><strong>Nome Popular:</strong> ${name}</p>
                                <p><strong>Nome Científico:</strong> ${especie}</p>
                                <p><strong>Local de Nidificação:</strong> ${local_nidificacao}</p>
                            </div>
                        </div>
                    `);
                }
            }
        }).addTo(map);

        map.fitBounds(geoJsonLayer.getBounds());



        // Evento do formulário para buscar abelhas
        form.addEventListener("submit", e => {
            e.preventDefault();
            const inputValue = e.target.bees.value.trim().toLowerCase();
            if (!inputValue) return;

            const toggleCheckbox = document.getElementById("toggle-bees");
            if (toggleCheckbox && toggleCheckbox.checked) {
                toggleCheckbox.click();
            }

            // Busca as abelhas diretamente na lista `data`
            const foundBees = data.filter(feature =>
                feature.properties.especie.toLowerCase() === inputValue
            );

            if (foundBees.length > 0) {
                findBees.style.display = "block";

                findBees.innerHTML = `
                    <h3 >Abelhas encontradas: ${foundBees.length}</h3>

                     <label>
                         <input type="checkbox" id="toggle-bees" />
                         Show Only Found Bees
                     </label>
                     
                    <div class="found-bees-box">
                        ${foundBees.map(bee => {

                    return `
                                <div>
                                    <p class="bee-item" data-lat="${bee.geometry.coordinates[1]}" data-lng="${bee.geometry.coordinates[0]}"><strong>Nome Popular:</strong> ${bee.properties.name}</p>
                                    <p><strong>Nome Científico:</strong> ${bee.properties.especie}</p>
                                    <p><strong>Local de Nidificação:</strong> ${bee.properties.local_nidificacao}</p>
                                </div>
                            `;
                }).join("")}
                    </div>
                `;

                // Adiciona o evento de clique para centralizar o mapa na localização da abelha
                const beeItems = document.querySelectorAll('.bee-item');
                beeItems.forEach(item => {
                    item.addEventListener('click', () => {
                        const lat = parseFloat(item.getAttribute('data-lat'));
                        const lng = parseFloat(item.getAttribute('data-lng'));

                        // Centraliza o mapa na localização da abelha clicada e aplica zoom
                        map.setView([lat, lng], 18.2);

                        // Encontra a camada correspondente à abelha e abre o popup
                        const beeFeature = data.find(feature =>
                            feature.geometry.coordinates[1] === lat && feature.geometry.coordinates[0] === lng
                        );

                        if (beeFeature) {
                            // Criar o marcador novamente com o ícone customizado
                            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

                            // Obter o nome e informações da abelha
                            const { name, especie, local_nidificacao } = beeFeature.properties;
                            const findBeeImg = allMelipon.find(item => item.name.toLowerCase() === especie.toLowerCase());

                            // Adicionar o conteúdo do popup
                            if (findBeeImg) {
                                marker.bindPopup(`
                                    <div class="pop-up-bees">
                                        <div>
                                            <img class="bee-img" src="${findBeeImg.img}" alt="${name}">
                                        </div>
                                        <div class="descriptions">
                                            <p><strong>Nome Popular:</strong> ${name}</p>
                                            <p><strong>Nome Científico:</strong> ${especie}</p>
                                            <p><strong>Local de Nidificação:</strong> ${local_nidificacao}</p>
                                        </div>
                                    </div>
                                `);
                            }

                            // Abrir o popup
                            marker.openPopup();
                        }
                    });
                });

                document.getElementById("toggle-bees").addEventListener("change", function () {
                    // Clear all markers from the map
                    map.eachLayer(layer => {
                        if (layer instanceof L.Marker) {
                            map.removeLayer(layer);
                        }
                    });

                    if (this.checked) {
                        // Add only the found bees to the map
                        foundBees.forEach(bee => {
                            const lat = bee.geometry.coordinates[1];
                            const lng = bee.geometry.coordinates[0];

                            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
                            const { name, especie, local_nidificacao } = bee.properties;
                            const findBeeImg = allMelipon.find(item => item.name.toLowerCase() === especie.toLowerCase());

                            if (findBeeImg) {
                                marker.bindPopup(`
                                    <div class="pop-up-bees">
                                        <div>
                                            <img class="bee-img" src="${findBeeImg.img}" alt="${name}">
                                        </div>
                                        <div class="descriptions">
                                            <p><strong>Nome Popular:</strong> ${name}</p>
                                            <p><strong>Nome Científico:</strong> ${especie}</p>
                                            <p><strong>Local de Nidificação:</strong> ${local_nidificacao}</p>
                                        </div>
                                    </div>
                                `);
                            }
                        });
                    } else {
                        // Add all bees back to the map
                        data.forEach(bee => {
                            const lat = bee.geometry.coordinates[1];
                            const lng = bee.geometry.coordinates[0];

                            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
                            const { name, especie, local_nidificacao } = bee.properties;
                            const findBeeImg = allMelipon.find(item => item.name.toLowerCase() === especie.toLowerCase());

                            if (findBeeImg) {
                                marker.bindPopup(`
                                    <div class="pop-up-bees">
                                        <div>
                                            <img class="bee-img" src="${findBeeImg.img}" alt="${name}">
                                        </div>
                                        <div class="descriptions">
                                            <p><strong>Nome Popular:</strong> ${name}</p>
                                            <p><strong>Nome Científico:</strong> ${especie}</p>
                                            <p><strong>Local de Nidificação:</strong> ${local_nidificacao}</p>
                                        </div>
                                    </div>
                                `);
                            }
                        });
                    }
                });

            } else {
                findBees.style.display = "block";
                findBees.innerHTML = `<p>Nenhuma abelha encontrada com esse nome.</p>`;
            }
        });

    })
    .catch(error => console.error("Erro ao carregar beesGeo.json:", error));



if (formClass.style.display === "" || formClass.style.display === "none") {
    formClass.style.display = "block";
}

toggleButton.addEventListener("click", () => {
    // Toggle the form visibility
    if (formClass.style.display === "none" || formClass.style.display === "") {
        formClass.style.display = "block";
    } else {
        formClass.style.display = "none";
    }
});

// let popupLatLong = L.popup();

// function onMapClick(e) {
//     popupLatLong
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(map);
// }

// map.on('click', onMapClick);

