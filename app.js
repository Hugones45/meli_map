const speciesListTitle = document.querySelector(".all-species-list");
const speciesList = document.querySelector(".content-all-species");
const head = document.querySelector("head");

let showAllTheBeesOnMap = false;

const allMelipon = [
    {
        name: 'Irai',
        img: "imgs/abelha-irai.jpg",
        colorBee: "#00FF00"
    },
    {
        name: 'Mandaçaia',
        img: "imgs/abelha-mandacaia.jpg",
        colorBee: "#FFBF00"
    },
    {
        name: 'Mandaguari Preta',
        img: "imgs/abelha-mandaguari-preta.jpg",
        colorBee: "#00008B"
    },
    {
        name: 'Jatai',
        img: "imgs/Abelhas-Jatai.jpg",
        colorBee: "#F660AB"
    },
    {
        name: 'Arapua',
        img: "imgs/urupua.jpg",
        colorBee: "#CCCCFF"
    },
    {
        name: 'Caga-Fogo',
        img: "imgs/tataira.jpg",
        colorBee: "#FF2400"
    }
];

fetch("beesGeo.json")
    .then(response => response.json())
    .then(data => {
        const uniqueBees = [...new Set(data.map((item) => item.properties.popularName))];

        const alterarColor = (name) => {
            const aletredColor = allMelipon.find((item) => item.name === name)['colorBee'];
            return aletredColor;
        };

        const createMarker = (bee) => {
            const lat = bee.geometry.coordinates[1];
            const lng = bee.geometry.coordinates[0];
            const beeName = bee.properties.popularName.toLowerCase().replace(/\s+/g, '-');
            const customIcon = L.icon({
                className: `custom-icon ${beeName}`,
                iconUrl: 'imgs/bee-icon-map.png',
                iconSize: [35, 35],
                iconAnchor: [22, 22],
                popupAnchor: [-3, -22]
            });
            const marker = L.marker([lat, lng], { icon: customIcon });
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
            return marker;
        };

        const markers = data.map(bee => createMarker(bee));
        markers.forEach(marker => marker.addTo(map));

        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds());

        speciesList.innerHTML = uniqueBees.map((name) => {
            return `<p class="bee-name" data-name="${name}" style="color: ${alterarColor(name)}">${name}</p>`;
        }).join("");

        head.innerHTML += uniqueBees.map((name) => {
            const beeName = name.toLowerCase().replace(/\s+/g, '-');
            const color = alterarColor(name);
            return `
                <style class="contorn-bees">
                    .custom-icon.${beeName} {
                        filter: drop-shadow(0 0 8px white) drop-shadow(0 0 4px ${color});
                    }

                    .custom-icon img {
                        width: 100%;
                        height: 100%;
                    }
                </style>
            `;
        }).join("");

        document.querySelectorAll('.bee-name').forEach(bee => {
            bee.addEventListener('click', (e) => {
                const beeName = e.target.dataset.name.toLowerCase().replace(/\s+/g, '-');

                markers.forEach(marker => map.removeLayer(marker));

                const filteredMarkers = markers.filter(marker => {
                    const markerBeeName = marker.options.icon.options.className.split(' ')[1];
                    return markerBeeName === beeName;
                });

                filteredMarkers.forEach(marker => marker.addTo(map));

                const filteredGroup = L.featureGroup(filteredMarkers);
                map.fitBounds(filteredGroup.getBounds());
            });
        });

        const showAllBees = () => {
            markers.forEach(marker => map.removeLayer(marker));

            markers.forEach(marker => marker.addTo(map));

            map.fitBounds(group.getBounds());
        };

        const toggleBeesButton = document.getElementById("toggle-bees");
        if (toggleBeesButton) {
            toggleBeesButton.addEventListener("click", showAllBees);
        }

        speciesListTitle.addEventListener('click', () => {
            if (speciesList.style.display === "none" || speciesList.style.display === "") {
                speciesList.style.display = "block";

                if (!document.getElementById('toggle-bees')) {
                    const label = document.createElement('label');
                    label.innerHTML = `<button type='button' id='toggle-bees'>Show All the Bees</button>`;
                    speciesList.appendChild(label);

                    document.getElementById("toggle-bees").addEventListener("click", showAllBees);
                }
            } else {
                speciesList.style.display = "none";
            }
        });
    });