const form = document.querySelector(".form-container")
const hideButton = document.querySelector(".hide-button")
const toggleButton = document.querySelector(".toggle-button button");
const formContent = document.querySelector(".form-content");
const findBees = document.querySelector(".find-bees");
const formClass = document.querySelector(".form-class")
const checkbox = document.querySelector(".checkbox")
const allBees = document.querySelector(".all-species")
const speciesListTitle = document.querySelector(".all-species-list")
const speciesList = document.querySelector(".content-all-species")
const hideButtonOfSearch = document.querySelector(".hide-button-of-search")


const selectedBees = []

const allMelipon = [
    {
        name: 'Irai',
        img: "imgs/abelha-irai.jpg"
    },
    {
        name: 'Mandaçaia',
        img: "imgs/abelha-mandacaia.jpg"
    },
    {
        name: 'Mandaguari Preta',
        img: "imgs/abelha-mandaguari-preta.jpg"
    },
    {
        name: 'Jatai',
        img: "imgs/Abelhas-Jatai.jpg"
    },
    {
        name: 'Arapua',
        img: "imgs/urupua.jpg"
    },
    {
        name: 'Caga-Fogo',
        img: "imgs/tataira.jpg"
    }
]

var customIcon = L.icon({
    className: 'custom-icon', // Add a class for styling
    iconUrl: 'imgs/bee-icon-map.png',
    iconSize: [35, 35],
    iconAnchor: [22, 22], // Centraliza melhor o ícone
    popupAnchor: [-3, -22] // Ajusta a posição do popup
});

// Add CSS styles for the custom icon
const style = document.createElement('style');
style.innerHTML = `
    .custom-icon  {
        filter: drop-shadow(0 0 3px white) drop-shadow(0 0 4px white);
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
        const uniqueBees = [...new Set(data.map((item) => item.properties.popularName))];

        speciesList.innerHTML = uniqueBees.map((name) => {
            return `<p class="bee-name" data-name="${name}">${name}</p>`;
        }).join("");

        // Add event listener to each bee name
        document.querySelectorAll('.bee-name').forEach(bee => {
            bee.addEventListener('click', (e) => {
                const beeName = e.target.dataset.name;
                navigator.clipboard.writeText(beeName);

                // Show a temporary copy message
                const msg = document.createElement('div');
                msg.textContent = `"${beeName}" copied!`;
                msg.style.position = 'fixed';
                msg.style.top = '150px';
                msg.style.left = '50%';
                msg.style.transform = 'translateX(-50%)';
                msg.style.background = '#ff4618';
                msg.style.color = 'white';
                msg.style.padding = '10px';
                msg.style.borderRadius = '5px';
                msg.style.zIndex = '1000';
                document.body.appendChild(msg);

                setTimeout(() => msg.remove(), 2000); // Remove after 2 seconds
            });
        });
        const geoJsonLayer = L.geoJSON(data, {
            pointToLayer: (feature, latlng) => L.marker(latlng, { icon: customIcon }),
            onEachFeature: (feature, layer) => {
                const { popularName, scientificName, local_nidificacao, id } = feature.properties;
                const findBeeImg = allMelipon.find(item => item.name.toLowerCase() === popularName.toLowerCase());

                if (findBeeImg) {
                    layer.bindPopup(`
                        <div class="pop-up-bees">
                            <div>
                                <img class="bee-img" src="${findBeeImg.img}" alt="${popularName}">
                            </div>
                            <div class="descriptions">
                                <p><strong>Hive Number:</strong> ${id}</p>
                                <p><strong>Common Name:</strong> ${popularName}</p>
                                <p><strong>Scientific Name:</strong> ${scientificName}</p>
                                <p><strong>Nesting Location:</strong> ${local_nidificacao}</p>
                            </div>
                        </div>
                    `);
                }
            }
        }).addTo(map);

        map.fitBounds(geoJsonLayer.getBounds());



        form.addEventListener("submit", e => {
            e.preventDefault();
            const inputValue = e.target.bees.value.trim().toLowerCase();

            // Clear all markers from the map before adding the new ones
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            // Busca as abelhas diretamente na lista `data`
            const foundBees = data.filter(feature =>
                feature.properties.popularName.toLowerCase() === inputValue
            );


            if (foundBees.length > 0) {
                findBees.style.display = "block";
                findBees.innerHTML = `
                    <h3>Total Hives Count: ${data.length}</h3>

                    <h3>Hives found: ${foundBees.length}</h3>
                    <label>
                        <input type="checkbox" id="toggle-bees" />
                        Show All the Bees
                    </label>
                    <div class="found-bees-box">
                         ${foundBees.map(bee => {
                    return `
                                <div>
                                    <p class="bee-item" data-lat="${bee.geometry.coordinates[1]}" data-lng="${bee.geometry.coordinates[0]}">
                                        <strong class="click-be-name">Hive number:</strong> ${bee.properties.id}
                                    </p>
                                    
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
                        map.setView([lat, lng], 15);

                        // Encontra a camada correspondente à abelha e abre o popup
                        const beeFeature = data.find(feature =>
                            feature.geometry.coordinates[1] === lat && feature.geometry.coordinates[0] === lng
                        );

                        if (beeFeature) {
                            // Criar o marcador novamente com o ícone customizado
                            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

                            // Obter o nome e informações da abelha
                            const { popularName, scientificName, local_nidificacao, id } = beeFeature.properties;
                            const findBeeImg = allMelipon.find(item => item.name.toLowerCase() === popularName.toLowerCase());



                            // Adicionar o conteúdo do popup
                            if (findBeeImg) {
                                marker.bindPopup(`
                                       <div class="pop-up-bees">
                                           <div>
                                               <img class="bee-img" src="${findBeeImg.img}" alt="${popularName}">
                                           </div>
                                           <div class="descriptions">
                                               <p><strong>Hive Number:</strong> ${id}</p>
                                               <p><strong>Common Name:</strong> ${popularName}</p>
                                               <p><strong>Scientific Name:</strong> ${scientificName}</p>
                                               <p><strong>Nesting Location:</strong> ${local_nidificacao}</p>
                                           </div>
                                       </div>
                                   `);
                            }

                            // Abrir o popup
                            marker.openPopup();
                        }
                    });
                });

                // Add markers for the found bees
                foundBees.forEach(bee => {
                    const lat = bee.geometry.coordinates[1];
                    const lng = bee.geometry.coordinates[0];
                    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
                    const { popularName, scientificName, local_nidificacao, id } = bee.properties;
                    const findBeeImg = allMelipon.find(item => item.name.toLowerCase() === popularName.toLowerCase());



                    if (findBeeImg) {
                        marker.bindPopup(`
                            <div class="pop-up-bees">
                                <div>
                                    <img class="bee-img" src="${findBeeImg.img}" alt="${scientificName}">
                                </div>
                                <div class="descriptions">
                                    <p><strong>Hive Number:</strong> ${id}</p>
                                    <p><strong>Common Name:</strong> ${scientificName}</p>
                                    <p><strong>Scientific Name:</strong> ${popularName}</p>
                                    <p><strong>Nesting Location:</strong> ${local_nidificacao}</p>
                                </div>
                            </div>
                        `);
                    }
                });

                // Add the toggle checkbox functionality
                document.getElementById("toggle-bees").addEventListener("change", function () {
                    // Clear all markers from the map
                    map.eachLayer(layer => {
                        if (layer instanceof L.Marker) {
                            map.removeLayer(layer);
                        }
                    });

                    if (!this.checked) {
                        // Add only the found bees to the map
                        foundBees.forEach(bee => {
                            const lat = bee.geometry.coordinates[1];
                            const lng = bee.geometry.coordinates[0];
                            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
                            const { popularName, scientificName, local_nidificacao, id } = bee.properties;
                            const findBeeImg = allMelipon.find(item => item.name.toLowerCase() === popularName.toLowerCase());

                            if (findBeeImg) {
                                marker.bindPopup(`
                                    <div class="pop-up-bees">
                                        <div>
                                            <img class="bee-img" src="${findBeeImg.img}" alt="${popularName}">
                                        </div>
                                        <div class="descriptions">
                                            <p><strong>Hive Number:</strong> ${id}</p>
                                            <p><strong>Common Name:</strong>${popularName}</p>
                                            <p><strong>Scientific Name:</strong> ${scientificName}</p>
                                            <p><strong>Nesting Location:</strong> ${local_nidificacao}</p>
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
                            const { popularName, scientificName, local_nidificacao, id } = bee.properties;
                            const findBeeImg = allMelipon.find(item => item.name.toLowerCase() === popularName.toLowerCase());

                            if (findBeeImg) {
                                marker.bindPopup(`
                                    <div class="pop-up-bees">
                                        <div>
                                            <img class="bee-img" src="${findBeeImg.img}" alt="${popularName}">
                                        </div>
                                        <div class="descriptions">
                                            <p><strong>Hive Number:</strong> ${id}</p>
                                            <p><strong>Common Name:</strong> ${popularName}</p>
                                            <p><strong>Scientific Name:</strong> ${scientificName}</p>
                                            <p><strong>Nesting Location:</strong> ${local_nidificacao}</p>
                                        </div>
                                    </div>
                                `);
                            }
                        });
                    }
                });

            } else {
                // If no bees were found, keep all markers on the map
                findBees.style.display = "block";
                findBees.innerHTML = `<p>No bee found with that name.</p>`;

                data.forEach(bee => {
                    const lat = bee.geometry.coordinates[1];
                    const lng = bee.geometry.coordinates[0];
                    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
                    const { popularName, scientificName, local_nidificacao, id } = bee.properties;
                    const findBeeImg = allMelipon.find(item => item.name.toLowerCase() === popularName.toLowerCase());

                    if (findBeeImg) {
                        marker.bindPopup(`
                            <div class="pop-up-bees">
                                <div>
                                    <img class="bee-img" src="${findBeeImg.img}" alt="${popularName}">
                                </div>
                                <div class="descriptions">
                                    <p><strong>Hive Number:</strong> ${id}</p>
                                    <p><strong>Common Name:</strong> ${popularName}</p>
                                    <p><strong>Scientific Name:</strong> ${scientificName}</p>
                                    <p><strong>Nesting Location:</strong> ${local_nidificacao}</p>
                                </div>
                            </div>
                        `);
                    }
                });
            }
        });
    })


if (formClass.style.display === "" || formClass.style.display === "none") {
    formClass.style.display = "block";
}

toggleButton.addEventListener("click", () => {
    // Toggle the form visibility
    if (formClass.style.display === "none" || formClass.style.display === "") {
        hideButtonOfSearch.textContent = "Hide search"

        formClass.style.display = "block";
    } else {
        hideButtonOfSearch.textContent = "Show search"

        formClass.style.display = "none";

    }
});

speciesListTitle.addEventListener('click', e => {
    if (speciesList.style.display === "none" || speciesList.style.display === "") {

        speciesList.style.display = "block";
    } else {
        speciesList.style.display = "none";
    }
})

