/* =========================================================
   PARK-AI SMART PARKING
   JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    // =========================================
// SIDEBAR NAVIGATION
// =========================================



    /* =====================================================
       DATA
    ====================================================== */

    const slots = {

    A1: {
        status: "Available",
        type: "car",
        feature: "Standard",
        nearEntrance: true,
        accessible: false,
        ev: false
    },

    A2: {
        status: "Occupied",
        type: "car",
        feature: "Standard",
        nearEntrance: false,
        accessible: false,
        ev: false
    },

    A3: {
        status: "Available",
        type: "car",
        feature: "Standard",
        nearEntrance: false,
        accessible: false,
        ev: false
    },

    A4: {
        status: "EV",
        type: "ev",
        feature: "EV Charging",
        nearEntrance: false,
        accessible: false,
        ev: true
    },

    A5: {
        status: "Available",
        type: "car",
        feature: "Standard",
        nearEntrance: true,
        accessible: false,
        ev: false
    },


    B1: {
    status: "Available",
    type: "car",
    feature: "Accessible",
    nearEntrance: true,
    accessible: true,
    ev: false
},

    B2: {
        status: "Occupied",
        type: "car",
        feature: "Standard",
        nearEntrance: false,
        accessible: false,
        ev: false
    },

    B3: {
        status: "Available",
        type: "car",
        feature: "Standard",
        nearEntrance: false,
        accessible: false,
        ev: false
    },

    B4: {
        status: "Reserved",
        type: "car",
        feature: "Reserved",
        nearEntrance: true,
        accessible: false,
        ev: false
    },

    B5: {
        status: "Occupied",
        type: "car",
        feature: "Standard",
        nearEntrance: false,
        accessible: false,
        ev: false
    },


    C1: {
        status: "Maintenance",
        type: "car",
        feature: "Maintenance",
        nearEntrance: false,
        accessible: false,
        ev: false
    },

    C2: {
        status: "Available",
        type: "car",
        feature: "Standard",
        nearEntrance: false,
        accessible: false,
        ev: false
    },

    C3: {
        status: "Occupied",
        type: "car",
        feature: "Standard",
        nearEntrance: false,
        accessible: false,
        ev: false
    },

    C4: {
        status: "Available",
        type: "car",
        feature: "Standard",
        nearEntrance: true,
        accessible: false,
        ev: false
    },

    C5: {
        status: "Available",
        type: "car",
        feature: "Standard",
        nearEntrance: true,
        accessible: false,
        ev: false
    }

};
// =========================================
// PARKING ANALYTICS COUNTERS
// =========================================

let vehiclesEntered = 0;
let vehiclesExited = 0;


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const availableCount =
        document.getElementById("availableCount");

    const topOccupied =
        document.getElementById("topOccupied");

    const topTotal =
        document.getElementById("topTotal");

    const totalSlots =
        document.getElementById("totalSlots");

    const statsAvailable =
        document.getElementById("statsAvailable");

    const statsOccupied =
        document.getElementById("statsOccupied");

    const statsEV =
        document.getElementById("statsEV");

    const recommendedSlot =
        document.getElementById("recommendedSlot");

    const recommendationMessage =
        document.getElementById("recommendationMessage");

    const recommendationBox =
        document.getElementById("recommendationBox");

    const reserveButton =
        document.getElementById("reserveButton");

    const releaseButton =
        document.getElementById("releaseButton");

    const resetButton =
        document.getElementById("resetButton");

    const findBestButton =
        document.getElementById("findBestButton");

    const reservationStatus =
        document.getElementById("reservationStatus");

    const slotInfoMessage =
        document.getElementById("slotInfoMessage");

    const infoSlot =
        document.getElementById("infoSlot");

    const infoVehicle =
        document.getElementById("infoVehicle");

    const infoStatus =
        document.getElementById("infoStatus");

    const infoLocation =
        document.getElementById("infoLocation");

    const infoFeature =
        document.getElementById("infoFeature");

    const evCharging =
        document.getElementById("evCharging");

    const accessibleParking =
        document.getElementById("accessibleParking");

    const nearEntrance =
        document.getElementById("nearEntrance");

    const currentTime =
        document.getElementById("currentTime");

    const currentDate =
        document.getElementById("currentDate");


    /* =====================================================
       STATE
    ====================================================== */

    let selectedVehicle = "car";

    let recommended = "A1";

    let reservedSlot = null;
    // =========================================
// PARKING TIMER STATE
// =========================================

let parkingTimerInterval = null;
let parkingEntryTime = null;


    /* =====================================================
       VEHICLE BUTTONS
    ====================================================== */

    const vehicleButtons =
        document.querySelectorAll(".vehicle-card");

    vehicleButtons.forEach(button => {

        button.addEventListener("click", () => {

            vehicleButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            selectedVehicle =
                button.dataset.vehicle;

            findBestSlot();

        });

    });


    /* =====================================================
       SLOT CLICK
    ====================================================== */

    const parkingSlots =
        document.querySelectorAll(".parking-slot");

    parkingSlots.forEach(slot => {

        slot.addEventListener("click", () => {

            const slotName =
                slot.dataset.slot;

            showSlotInformation(slotName);

        });

    });


    /* =====================================================
       SHOW SLOT INFORMATION
    ====================================================== */

    function showSlotInformation(slotName) {

        const data = slots[slotName];

        if (!data) return;

        parkingSlots.forEach(slot => {
            slot.classList.remove("selected");
        });

        const selectedElement =
            document.getElementById(
                `slot-${slotName}`
            );

        if (selectedElement) {
            selectedElement.classList.add("selected");
        }

        infoSlot.textContent =
            slotName;

        infoVehicle.textContent =
            formatVehicle(selectedVehicle);

        infoStatus.textContent =
            data.status;

        infoLocation.textContent =
            data.nearEntrance
                ? "Near Entrance"
                : "Standard";

        infoFeature.textContent =
            data.feature;

        slotInfoMessage.textContent =
            `${slotName} selected — ${data.status}.`;

    }


    /* =====================================================
       FIND BEST SLOT
    ====================================================== */

    findBestButton.addEventListener(
        "click",
        findBestSlot
    );


    function findBestSlot() {

        const needsEV =
            evCharging.checked ||
            selectedVehicle === "ev";

        const needsAccessible =
            accessibleParking.checked;

        const needsNearEntrance =
            nearEntrance.checked;


        let candidates =
            Object.keys(slots).filter(slotName => {

                const slot =
                    slots[slotName];

                const isAvailable =
                    slot.status === "Available" ||
                    slot.status === "EV" ||
                    slot.status === "Accessible";

                if (!isAvailable) {
                    return false;
                }

                if (
                    needsEV &&
                    !slot.ev
                ) {
                    return false;
                }

                if (
                    needsAccessible &&
                    !slot.accessible
                ) {
                    return false;
                }

                return true;

            });


        /* If no exact match, show message */

        if (candidates.length === 0) {

            recommended = null;

            recommendedSlot.textContent = "—";

            recommendationMessage.textContent =
                "No matching slot available.";

            recommendationMessage.style.color =
                "#ff687c";

            reserveButton.disabled = true;

            parkingSlots.forEach(slot => {
                slot.classList.remove("selected");
            });

            return;
        }


        /* =================================================
           SCORING SYSTEM
        ================================================== */

        candidates.sort((a, b) => {

            const slotA = slots[a];
            const slotB = slots[b];

            let scoreA = 0;
            let scoreB = 0;


            if (
                needsNearEntrance &&
                slotA.nearEntrance
            ) {
                scoreA += 30;
            }

            if (
                needsNearEntrance &&
                slotB.nearEntrance
            ) {
                scoreB += 30;
            }


            if (
                needsAccessible &&
                slotA.accessible
            ) {
                scoreA += 50;
            }

            if (
                needsAccessible &&
                slotB.accessible
            ) {
                scoreB += 50;
            }


            if (
                needsEV &&
                slotA.ev
            ) {
                scoreA += 60;
            }

            if (
                needsEV &&
                slotB.ev
            ) {
                scoreB += 60;
            }


            /* Prefer normal available slots */

            if (
                slotA.status === "Available"
            ) {
                scoreA += 10;
            }

            if (
                slotB.status === "Available"
            ) {
                scoreB += 10;
            }


            return scoreB - scoreA;

        });


        recommended =
            candidates[0];


        /* UPDATE UI */

        recommendedSlot.textContent =
            recommended;

        recommendationMessage.textContent =
            "Good choice!";

        recommendationMessage.style.color =
            "#40e98c";


        reserveButton.disabled =
            reservedSlot === recommended;


        /* Highlight recommendation */

        parkingSlots.forEach(slot => {
            slot.classList.remove("selected");
        });

        const recommendedElement =
            document.getElementById(
                `slot-${recommended}`
            );

        if (recommendedElement) {

            recommendedElement.classList.add(
                "selected"
            );

            showSlotInformation(
                recommended
            );

        }

    }


    /* =====================================================
       RESERVE
    ====================================================== */

    reserveButton.addEventListener(
        "click",
        reserveRecommendedSlot
    );


    function reserveRecommendedSlot() {

        if (!recommended) {
            return;
        }

        const slot =
            slots[recommended];

        if (!slot) {
            return;
        }

        if (
            slot.status !== "Available" &&
            slot.status !== "EV" &&
            slot.status !== "Accessible"
        ) {

            alert(
                "This parking slot is not available."
            );

            return;
        }


        reservedSlot =
            recommended;

        slot.status =
            "Reserved";


        const element =
            document.getElementById(
                `slot-${recommended}`
            );


        if (element) {

            element.classList.remove(
                "available",
                "ev",
                "accessible"
            );

            element.classList.add(
                "reserved"
            );

            const statusText =
                element.querySelector("span");

            if (statusText) {
                statusText.textContent =
                    "Reserved";
            }

        }


        reservationStatus.textContent =
            `✓ ${recommended} reserved successfully`;

        reservationStatus.style.color =
            "#3ee995";


        reserveButton.disabled = true;

        releaseButton.disabled = false;


        updateStatistics();

vehiclesEntered++;

recordSustainabilityEntry();

updateAnalytics();
generateParkingTicket();
startParkingTimer(recommended);

showSlotInformation(
    recommended
);

    }


    /* =====================================================
       RELEASE
    ====================================================== */

    releaseButton.addEventListener(
        "click",
        releaseReservedSlot
    );


    function releaseReservedSlot() {

        if (!reservedSlot) {
            return;
        }

        const slotName =
            reservedSlot;

        const slot =
            slots[slotName];

        slot.status =
            "Available";


        const element =
            document.getElementById(
                `slot-${slotName}`
            );


        if (element) {

            element.classList.remove(
                "reserved"
            );

            element.classList.add(
                "available"
            );

            const statusText =
                element.querySelector("span");

            if (statusText) {
                statusText.textContent =
                    "Available";
            }

        }


        reservationStatus.textContent =
            `${slotName} released`;

        reservationStatus.style.color =
            "#7185ad";


        reservedSlot = null;

        releaseButton.disabled =
            true;

        reserveButton.disabled =
            false;


        updateStatistics();

vehiclesExited++;

updateAnalytics();
stopParkingTimer();

showSlotInformation(
    slotName
);

    }


    /* =====================================================
       RESET
    ====================================================== */

    resetButton.addEventListener(
        "click",
        resetSearch
    );


    function resetSearch() {

        selectedVehicle =
            "car";

        reservedSlot =
            null;

        recommended =
            "A1";


        /* Restore checkboxes */

        evCharging.checked =
            false;

        accessibleParking.checked =
            false;

        nearEntrance.checked =
            true;


        /* Restore vehicle button */

        vehicleButtons.forEach(
            (button, index) => {

                button.classList.toggle(
                    "active",
                    index === 0
                );

            }
        );


        /* Restore slot states */

        const originalStates = {

    A1: ["available", "Available"],
    A2: ["occupied", "Occupied"],
    A3: ["available", "Available"],
    A4: ["ev", "EV"],
    A5: ["available", "Available"],

    B1: ["available", "Available"],
    B2: ["occupied", "Occupied"],
    B3: ["available", "Available"],
    B4: ["reserved", "Reserved"],
    B5: ["occupied", "Occupied"],

    C1: ["maintenance", "Maintenance"],
    C2: ["available", "Available"],
    C3: ["occupied", "Occupied"],
    C4: ["available", "Available"],
    C5: ["available", "Available"]

};


        Object.keys(originalStates)
            .forEach(slotName => {

                const [
                    className,
                    text
                ] =
                    originalStates[slotName];


                const element =
                    document.getElementById(
                        `slot-${slotName}`
                    );

                if (!element) return;


                element.classList.remove(
                    "available",
                    "occupied",
                    "ev",
                    "accessible",
                    "reserved",
                    "selected"
                );

                element.classList.add(
                    className
                );


                const statusText =
                    element.querySelector(
                        "span"
                    );

                if (statusText) {
                    statusText.textContent =
                        text;
                }


                slots[slotName].status =
                    text;

            });


        recommendationMessage.textContent =
            "Good choice!";

        recommendationMessage.style.color =
            "#40e98c";

        recommendedSlot.textContent =
            "A1";

        reservationStatus.textContent =
            "No slot reserved";

        reservationStatus.style.color =
            "#7285ad";


        reserveButton.disabled =
            false;

        releaseButton.disabled =
            true;


        updateStatistics();

updateSustainability();

showSlotInformation("A1");

    }


    /* =====================================================
       STATISTICS
    ====================================================== */

    function updateStatistics() {

        const total =
            Object.keys(slots).length;


        const occupied =
            Object.values(slots)
                .filter(slot =>
                    slot.status === "Occupied"
                ).length;


        const available =
            Object.values(slots)
                .filter(slot =>
                    slot.status === "Available" ||
                    slot.status === "EV" ||
                    slot.status === "Accessible"
                ).length;


        const evSlots =
            Object.values(slots)
                .filter(slot =>
                    slot.ev
                ).length;


        availableCount.textContent =
            available;

        topOccupied.textContent =
            occupied;

        topTotal.textContent =
            total;

        totalSlots.textContent =
            total;

        statsAvailable.textContent =
            available;

        statsOccupied.textContent =
            occupied;

        statsEV.textContent =
            evSlots;

    }


    /* =====================================================
       TIME / DATE
    ====================================================== */

    function updateClock() {

        const now =
            new Date();


        let hours =
            now.getHours();

        const minutes =
            String(
                now.getMinutes()
            ).padStart(2, "0");


        const suffix =
            hours >= 12
                ? "PM"
                : "AM";


        hours =
            hours % 12 || 12;


        currentTime.textContent =
            `${hours}:${minutes} ${suffix}`;


        const date =
            now.toLocaleDateString(
                "en-US",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
            );


        currentDate.textContent =
            date;

    }
    // Start live clock
updateClock();

setInterval(updateClock, 1000);


    /* =====================================================
   SIDEBAR NAVIGATION
====================================================== */

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(function (item) {

    item.addEventListener("click", function () {

        // Remove active state from all navigation buttons
        navItems.forEach(function (nav) {
            nav.classList.remove("active");
        });

        // Activate clicked navigation button
        item.classList.add("active");

        const text = item
            .querySelector("span:last-child")
            ?.textContent
            .trim();

        let target = null;

        /*
         * Find the correct existing section
         * from your current HTML.
         */

        if (text === "Dashboard") {
            target = document.querySelector(".dashboard");
        }

        else if (text === "Find Best Slot") {
            target = document.querySelector(".control-panel");
        }

        else if (text === "My Reservations") {
            target = document.querySelector(".control-panel");
        }

        else if (text === "Parking Map") {
            target = document.querySelector(".parking-section");
        }

        else if (text === "Statistics") {
            target = document.querySelector(".statistics-section");
        }

        else if (text === "Settings") {
            target = document.querySelector(".settings-section");
        }

        else if (text === "Help") {
            target = document.querySelector(".help-section");
        }

        // If the section exists, scroll to it
        if (target) {

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        } else {

            console.log(
                "This section has not been created yet:",
                text
            );

        }

    });

});


    navItems.forEach(item => {

        item.addEventListener(
            "click",
            () => {

                navItems.forEach(
                    nav =>
                        nav.classList.remove(
                            "active"
                        )
                );

                item.classList.add(
                    "active"
                );

            }
        );

    });


    /* =====================================================
       HELPERS
    ====================================================== */

    function formatVehicle(vehicle) {

        const names = {
            car: "Car",
            bike: "Bike",
            suv: "SUV",
            ev: "EV"
        };

        return (
            names[vehicle] ||
            "Car"
        );

    }
    /* =====================================================
   PARKING ANALYTICS
====================================================== */

function updateAnalytics() {

    const slotNames = Object.keys(slots);

    const total = slotNames.length;

    const occupiedSlots = slotNames.filter(
        slotName => slots[slotName].status === "Occupied"
    ).length;

    const evSlots = slotNames.filter(
        slotName => slots[slotName].ev === true
    ).length;


    /* Current Occupancy */

    const occupancyElement =
        document.getElementById("analyticsOccupancy");

    const todayOccupancyElement =
        document.getElementById("todayOccupancy");

    if (occupancyElement) {
        occupancyElement.textContent = occupiedSlots;
    }

    if (todayOccupancyElement) {
        todayOccupancyElement.textContent = occupiedSlots;
    }


    /* EV Usage */

    const evUsageElement =
        document.getElementById("evUsage");

    if (evUsageElement) {
        evUsageElement.textContent = evSlots;
    }


    /* Vehicles Entered / Exited */

    document.getElementById("vehiclesEntered").textContent =
        vehiclesEntered;

    document.getElementById("vehiclesExited").textContent =
        vehiclesExited;


    /* Demo values */

    document.getElementById("avgDuration").textContent =
        "1h 42m";

    document.getElementById("peakHour").textContent =
        "1:00 PM";


    /* Most Used Zone */

    const zoneUsage = {
        A: 0,
        B: 0,
        C: 0
    };

    slotNames.forEach(slotName => {

        if (slots[slotName].status === "Occupied") {

            const zone = slotName.charAt(0);

            zoneUsage[zone]++;
        }

    });

    const mostUsedZone =
        Object.keys(zoneUsage).reduce((a, b) =>
            zoneUsage[a] >= zoneUsage[b] ? a : b
        );

    document.getElementById("mostUsedZone").textContent =
        "Zone " + mostUsedZone;


    /* Update latest chart value */

    const occupancyPercentage =
        Math.round((occupiedSlots / total) * 100);

    const chartBars =
        document.querySelectorAll(".chart-bar");

    const chartValues =
        document.querySelectorAll(".chart-value");

    if (chartBars.length > 0) {

        chartBars[chartBars.length - 1].style.height =
            occupancyPercentage + "%";
    }

    if (chartValues.length > 0) {

        chartValues[chartValues.length - 1].textContent =
            occupancyPercentage + "%";
    }

}
// =========================================
// PARKING ALERTS
// =========================================

function updateAlerts() {

    const alertsList = document.getElementById("alertsList");

    if (!alertsList) return;

    const total = Object.keys(slots).length;

    const occupied = Object.values(slots).filter(
        slot => slot.status === "Occupied"
    ).length;

    const available = Object.values(slots).filter(
        slot => slot.status === "Available"
    ).length;

    const evAvailable = Object.values(slots).filter(
        slot => slot.ev === true && slot.status === "Available"
    ).length;

    const occupancyPercentage =
        Math.round((occupied / total) * 100);

    let alerts = [];

    // High occupancy alert
    if (occupancyPercentage >= 80) {
        alerts.push(`
            <div class="parking-alert warning">
                <span class="alert-icon">⚠️</span>
                <div>
                    <strong>High Occupancy</strong>
                    <p>Parking area is ${occupancyPercentage}% occupied.</p>
                </div>
            </div>
        `);
    }

    // EV charging alert
    alerts.push(`
        <div class="parking-alert ev-alert">
            <span class="alert-icon">⚡</span>
            <div>
                <strong>EV Charging</strong>
                <p>EV Zone has ${evAvailable} available chargers.</p>
            </div>
        </div>
    `);

    // Zone B availability
    const zoneBAvailable = Object.keys(slots).filter(
        slotName =>
            slotName.startsWith("B") &&
            slots[slotName].status === "Available"
    ).length;

    alerts.push(`
        <div class="parking-alert info">
            <span class="alert-icon">🅿️</span>
            <div>
                <strong>Zone B Availability</strong>
                <p>Zone B has ${zoneBAvailable} available spaces.</p>
            </div>
        </div>
    `);

    // Maintenance alert
    const maintenanceSlot = Object.keys(slots).find(
        slotName => slots[slotName].status === "Maintenance"
    );

    if (maintenanceSlot) {
        alerts.push(`
            <div class="parking-alert danger">
                <span class="alert-icon">🚧</span>
                <div>
                    <strong>Slot Unavailable</strong>
                    <p>${maintenanceSlot} is temporarily unavailable.</p>
                </div>
            </div>
        `);
    }

    alertsList.innerHTML = alerts.join("");
}
// =========================================
// DIGITAL PARKING TICKET
// =========================================

function generateParkingTicket() {

    const ticketOverlay =
        document.getElementById("ticketOverlay");

    const ticketSlot =
        document.getElementById("ticketSlot");

    const ticketVehicle =
        document.getElementById("ticketVehicle");

    const ticketTime =
        document.getElementById("ticketTime");

    const ticketReservation =
        document.getElementById("ticketReservation");

    const qrCode =
        document.getElementById("qrCode");

    if (!ticketOverlay) {
        console.error("Ticket overlay not found.");
        return;
    }

    // Current time
    const now = new Date();

    const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    // Generate reservation ID
    const reservationID =
        "PK-" + Math.floor(1000 + Math.random() * 9000);

    // Fill ticket details
    ticketSlot.textContent = recommended;

    ticketVehicle.textContent =
        selectedVehicle.charAt(0).toUpperCase() +
        selectedVehicle.slice(1);

    ticketTime.textContent = time;

    ticketReservation.textContent =
        reservationID;

    // SHOW TICKET FIRST
    ticketOverlay.classList.add("show");

    // Generate QR code
    qrCode.innerHTML = "";

    if (typeof QRCode !== "undefined") {

        new QRCode(qrCode, {
            text:
                "PARK-AI | Slot: " +
                recommended +
                " | Reservation: " +
                reservationID +
                " | Entry: " +
                time,

            width: 150,
            height: 150
        });

    } else {

        // Fallback if QR library doesn't load
        qrCode.innerHTML = `
            <div style="
                width:100%;
                height:100%;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:16px;
                font-weight:bold;
                color:#111;
                text-align:center;
            ">
                QR CODE
            </div>
        `;
    }
}
// Close digital parking ticket
const ticketClose =
    document.getElementById("ticketClose");

const ticketOverlay =
    document.getElementById("ticketOverlay");

if (ticketClose) {
    ticketClose.addEventListener("click", function () {
        ticketOverlay.classList.remove("show");
    });
}

// Close when clicking outside the ticket
if (ticketOverlay) {
    ticketOverlay.addEventListener("click", function (event) {

        if (event.target === ticketOverlay) {
            ticketOverlay.classList.remove("show");
        }

    });
}
// Print digital parking ticket
const ticketPrint =
    document.getElementById("ticketPrint");

if (ticketPrint) {

    ticketPrint.addEventListener("click", function () {

        window.print();

    });

}
// =========================================
// PARKING TIMER
// =========================================

function startParkingTimer(slotName) {

    // Stop any existing timer
    if (parkingTimerInterval) {
        clearInterval(parkingTimerInterval);
    }

    // Save actual entry time
    parkingEntryTime = Date.now();

    localStorage.setItem(
        "parkingEntryTime",
        parkingEntryTime
    );

    localStorage.setItem(
        "parkingSlot",
        slotName
    );

    updateParkingTimer(slotName);

    parkingTimerInterval = setInterval(function () {

        updateParkingTimer(slotName);

    }, 1000);
}


function updateParkingTimer(slotName) {

    const timerSlot =
        document.getElementById("timerSlot");

    const timerStatus =
        document.getElementById("timerStatus");

    const timerEntry =
        document.getElementById("timerEntry");

    const parkingDuration =
        document.getElementById("parkingDuration");

    if (!parkingEntryTime) return;

    const elapsed =
        Date.now() - parkingEntryTime;

    const totalSeconds =
        Math.floor(elapsed / 1000);

    const hours =
        Math.floor(totalSeconds / 3600);

    const minutes =
        Math.floor((totalSeconds % 3600) / 60);

    const seconds =
        totalSeconds % 60;

    const formattedTime =
        String(hours).padStart(2, "0") +
        " : " +
        String(minutes).padStart(2, "0") +
        " : " +
        String(seconds).padStart(2, "0");

    const entryDate =
        new Date(parkingEntryTime);

    const entryTime =
        entryDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    timerSlot.textContent = slotName;
timerStatus.textContent = "OCCUPIED";
timerEntry.textContent = entryTime;
parkingDuration.textContent = formattedTime;
updateParkingFee();
}
function updateParkingFee() {

    const estimatedFee =
        document.getElementById("estimatedFee");

    const firstHourFee =
        document.getElementById("firstHourFee");

    const additionalHourFee =
        document.getElementById("additionalHourFee");

    const totalFee =
        document.getElementById("totalFee");

    const pricing = {
        car: { firstHour: 20, additionalHour: 10 },
        bike: { firstHour: 10, additionalHour: 5 },
        suv: { firstHour: 30, additionalHour: 15 },
        ev: { firstHour: 25, additionalHour: 12 }
    };

    const vehicle =
        pricing[selectedVehicle] || pricing.car;

    let fee = vehicle.firstHour;
    let additionalFee = 0;

    if (parkingEntryTime) {

        const elapsed =
            Date.now() - parkingEntryTime;

        const totalSeconds =
            Math.floor(elapsed / 1000);

        if (totalSeconds > 3600) {

            const additionalHours =
                Math.ceil(
                    (totalSeconds - 3600) / 3600
                );

            additionalFee =
                additionalHours *
                vehicle.additionalHour;

            fee =
                vehicle.firstHour +
                additionalFee;
        }
    }

    estimatedFee.textContent =
        "₹" + fee;

    firstHourFee.textContent =
        "₹" + vehicle.firstHour;

    additionalHourFee.textContent =
        "₹" + additionalFee;

    totalFee.textContent =
        "₹" + fee;
}
function stopParkingTimer() {

    if (parkingTimerInterval) {
        clearInterval(parkingTimerInterval);
        parkingTimerInterval = null;
    }

    parkingEntryTime = null;

    localStorage.removeItem("parkingEntryTime");
    localStorage.removeItem("parkingSlot");

    const timerSlot =
        document.getElementById("timerSlot");

    const timerStatus =
        document.getElementById("timerStatus");

    const timerEntry =
        document.getElementById("timerEntry");

    const parkingDuration =
        document.getElementById("parkingDuration");

    if (timerSlot) {
        timerSlot.textContent = "--";
    }

    if (timerStatus) {
        timerStatus.textContent = "AVAILABLE";
    }

    if (timerEntry) {
        timerEntry.textContent = "--:--";
    }

    if (parkingDuration) {
        parkingDuration.textContent = "00 : 00 : 00";
    }
}
// =========================================
// 🌱 SUSTAINABILITY / GREEN PARKING
// =========================================

// Sustainability demo assumptions
const sustainabilityData = {
    searchTimeSavedPerVehicle: 4,   // minutes
    fuelSavedPerVehicle: 0.15,      // litres
    co2PerLitre: 2.31               // kg CO₂ per litre
};

// Count EV reservations during this session
let evVehiclesEntered = 0;


// Update sustainability dashboard
function updateSustainability() {

    const co2Saved =
        document.getElementById("co2Saved");

    const drivingReduced =
        document.getElementById("drivingReduced");

    const fuelSaved =
        document.getElementById("fuelSaved");

    const searchTimeSaved =
        document.getElementById("searchTimeSaved");

    const evUtilization =
        document.getElementById("evUtilization");

    if (!co2Saved) return;


    // -----------------------------------------
    // PARKING ACTIVITY
    // -----------------------------------------

    const totalVehicles =
        vehiclesEntered;


    // -----------------------------------------
    // ESTIMATED SEARCH TIME SAVED
    // -----------------------------------------

    const estimatedSearchTime =
        totalVehicles *
        sustainabilityData.searchTimeSavedPerVehicle;


    // -----------------------------------------
    // ESTIMATED FUEL SAVED
    // -----------------------------------------

    const estimatedFuelSaved =
        totalVehicles *
        sustainabilityData.fuelSavedPerVehicle;


    // -----------------------------------------
    // ESTIMATED CO₂ SAVED
    // -----------------------------------------

    const estimatedCO2Saved =
        estimatedFuelSaved *
        sustainabilityData.co2PerLitre;


    // -----------------------------------------
    // EV UTILIZATION
    // -----------------------------------------

    const evUtilizationPercentage =
        totalVehicles > 0
            ? Math.round(
                (evVehiclesEntered / totalVehicles) * 100
            )
            : 0;


    // -----------------------------------------
    // UPDATE UI
    // -----------------------------------------

    co2Saved.textContent =
        estimatedCO2Saved.toFixed(1) + " kg";

    drivingReduced.textContent =
        estimatedSearchTime + " min";

    fuelSaved.textContent =
        estimatedFuelSaved.toFixed(1) + " L";

    searchTimeSaved.textContent =
        estimatedSearchTime + " min";

    evUtilization.textContent =
        evUtilizationPercentage + "%";
}


// Update sustainability when a vehicle enters
function recordSustainabilityEntry() {

    if (selectedVehicle === "ev") {
        evVehiclesEntered++;
    }

    updateSustainability();
}


// Initial sustainability display
updateSustainability();

/* =====================================================
   PARK-AI SMART ASSISTANT
===================================================== */

const openAssistantButton =
    document.getElementById("openAssistantButton");

const closeAssistantButton =
    document.getElementById("closeAssistantButton");

const aiChatWindow =
    document.getElementById("aiChatWindow");

const aiChatMessages =
    document.getElementById("aiChatMessages");

const aiChatInput =
    document.getElementById("aiChatInput");

const aiSendButton =
    document.getElementById("aiSendButton");


/* =====================================================
   OPEN ASSISTANT
===================================================== */

if (openAssistantButton) {

    openAssistantButton.addEventListener(
        "click",
        function () {

            aiChatWindow.classList.add("active");

            setTimeout(function () {

                aiChatInput.focus();

            }, 250);

        }
    );

}


/* =====================================================
   CLOSE ASSISTANT
===================================================== */

if (closeAssistantButton) {

    closeAssistantButton.addEventListener(
        "click",
        function () {

            aiChatWindow.classList.remove("active");

        }
    );

}


/* =====================================================
   SEND MESSAGE
===================================================== */

function sendAIMessage() {

    const message =
        aiChatInput.value.trim();

    if (!message) {
        return;
    }

    addUserMessage(message);

    aiChatInput.value = "";

    showAITyping();

    setTimeout(function () {

        removeAITyping();

        const response =
            generateAIResponse(message);

        addBotMessage(response);

    }, 700);

}


/* =====================================================
   USER MESSAGE
===================================================== */

function addUserMessage(message) {

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        "ai-message user-message";

    messageDiv.innerHTML = `

        <div class="message-bubble">

            <p>${escapeAIText(message)}</p>

        </div>

    `;

    aiChatMessages.appendChild(messageDiv);

    scrollAIChat();

}


/* =====================================================
   BOT MESSAGE
===================================================== */

function addBotMessage(message) {

    const messageDiv =
        document.createElement("div");

    messageDiv.className =
        "ai-message bot-message";

    messageDiv.innerHTML = `

        <div class="message-avatar">
            🤖
        </div>

        <div class="message-bubble">

            <p>${message}</p>

        </div>

    `;

    aiChatMessages.appendChild(messageDiv);

    scrollAIChat();

}


/* =====================================================
   TYPING
===================================================== */

function showAITyping() {

    const typingDiv =
        document.createElement("div");

    typingDiv.id =
        "aiTyping";

    typingDiv.className =
        "ai-message bot-message";

    typingDiv.innerHTML = `

        <div class="message-avatar">
            🤖
        </div>

        <div class="message-bubble">

            <div class="typing-message">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;

    aiChatMessages.appendChild(typingDiv);

    scrollAIChat();

}


function removeAITyping() {

    const typing =
        document.getElementById("aiTyping");

    if (typing) {
        typing.remove();
    }

}


/* =====================================================
   AI RESPONSE ENGINE
===================================================== */

function generateAIResponse(message) {

    const text =
        message.toLowerCase();


    /* BEST SLOT */

    if (
        text.includes("best slot") ||
        text.includes("find slot") ||
        text.includes("parking slot")
    ) {

        if (
            typeof recommended !== "undefined" &&
            recommended
        ) {

            return `
                Based on the current parking availability,
                <strong>${recommended}</strong> is my recommended
                slot for you. 🅿️
                <br><br>
                You can use the
                <strong>Reserve Slot</strong> button to reserve it.
            `;

        }

        return `
            Please use <strong>Find Best Slot</strong>
            to let PARK-AI analyze the available spaces. 🅿️
        `;

    }


    /* RESERVATION */

    if (
        text.includes("reserve") ||
        text.includes("reservation") ||
        text.includes("book")
    ) {

        return `
            To reserve a parking space:
            <br><br>
            1️⃣ Select your vehicle.
            <br>
            2️⃣ Choose your preferences.
            <br>
            3️⃣ Click <strong>Find Best Slot</strong>.
            <br>
            4️⃣ Click <strong>Reserve Slot</strong>.
            <br><br>
            Your parking timer will then start automatically. ⏱️
        `;

    }


    /* TIMER */

    if (
        text.includes("timer") ||
        text.includes("duration") ||
        text.includes("parking time")
    ) {

        return `
            The parking timer starts when your slot is
            reserved. ⏱️
            <br><br>
            It continuously tracks your parking duration
            until you release the slot.
        `;

    }


    /* FEE */

    if (
        text.includes("fee") ||
        text.includes("price") ||
        text.includes("cost") ||
        text.includes("charge")
    ) {

        return `
            PARK-AI calculates an estimated parking fee
            based on your vehicle type and parking duration. 💰
            <br><br>
            You can see the live estimate in the
            <strong>Parking Timer</strong> section.
        `;

    }


    /* RELEASE */

    if (
        text.includes("release") ||
        text.includes("leave") ||
        text.includes("exit")
    ) {

        return `
            To release your parking space, use the
            <strong>Release Slot</strong> button.
            <br><br>
            The slot will become available again and
            your parking timer will stop. 🚗
        `;

    }


    /* EV */

    if (
        text.includes("ev") ||
        text.includes("electric") ||
        text.includes("charging")
    ) {

        return `
            PARK-AI can prioritize EV charging spaces
            when you select an electric vehicle. ⚡
            <br><br>
            Enable the <strong>EV Charging</strong>
            preference before finding your best slot.
        `;

    }


    /* AVAILABLE */

    if (
        text.includes("available") ||
        text.includes("free")
    ) {

        const available =
            document.getElementById("availableCount");

        const count =
            available
                ? available.textContent
                : "several";

        return `
            There are currently
            <strong>${count}</strong>
            available parking slots. 🟢
            <br><br>
            Would you like me to help you find the
            best one?
        `;

    }


    /* HELLO */

    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {

        return `
            Hello! 👋
            <br><br>
            I'm ready to help you with parking,
            reservations, EV charging, parking fees,
            and your parking timer.
        `;

    }


    /* DEFAULT */

    return `
        I'm your PARK-AI parking assistant. 🤖
        <br><br>
        You can ask me things like:
        <br>
        • <strong>Find me the best slot</strong>
        <br>
        • <strong>How do I reserve?</strong>
        <br>
        • <strong>How does the timer work?</strong>
        <br>
        • <strong>How much does parking cost?</strong>
        <br>
        • <strong>How do I release my slot?</strong>
    `;

}


/* =====================================================
   QUICK QUESTIONS
===================================================== */

document
    .querySelectorAll(".quick-question")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const question =
                    button.dataset.question;

                aiChatInput.value =
                    question;

                sendAIMessage();

            }
        );

    });


/* =====================================================
   SEND BUTTON
===================================================== */

if (aiSendButton) {

    aiSendButton.addEventListener(
        "click",
        sendAIMessage
    );

}


/* =====================================================
   ENTER KEY
===================================================== */

if (aiChatInput) {

    aiChatInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendAIMessage();

            }

        }
    );

}


/* =====================================================
   AUTO SCROLL
===================================================== */

function scrollAIChat() {

    aiChatMessages.scrollTop =
        aiChatMessages.scrollHeight;

}


/* =====================================================
   SECURITY
===================================================== */

function escapeAIText(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}
});