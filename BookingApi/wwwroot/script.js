const roomsById = {};
const form = document.getElementById('bookingForm');
const message = document.getElementById('message');
const list = document.getElementById('bookingList');

function showMessage(text, color) {
    message.style.color = color;
    message.textContent = text;
}

function readError(errorText) {
    try {
        const parsed = JSON.parse(errorText);
        if (typeof parsed === 'string') return parsed;
        if (parsed.message) return parsed.message;
    } catch (err) {
        // Svaret var inte JSON.
    }

    if (!errorText || errorText.length > 180 || errorText.includes('Exception')) {
        return 'Bokningen kunde inte sparas. Kontrollera rum och tider.';
    }

    return errorText;
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    createBooking();
});

document.getElementById('refreshBtn').addEventListener('click', fetchBookings);

async function createBooking() {
    const roomId = document.getElementById('roomId').value;
    const customerName = document.getElementById('customerName').value.trim();
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!roomId || !customerName || !startTime || !endTime) {
        showMessage('Fyll i rum, namn, start och slut.', '#9b2331');
        return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
        showMessage('Sluttiden måste vara efter starttiden.', '#9b2331');
        return;
    }

    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                roomId: parseInt(roomId, 10),
                customerName,
                startTime,
                endTime
            })
        });

        if (response.ok) {
            showMessage('Bokningen är sparad.', '#1d7a46');
            document.getElementById('startTime').value = '';
            document.getElementById('endTime').value = '';
            fetchBookings();
        } else {
            showMessage(readError(await response.text()), '#9b2331');
        }
    } catch (err) {
        console.error(err);
        showMessage('Kunde inte nå servern.', '#9b2331');
    } finally {
        submitBtn.disabled = false;
    }
}

async function deleteBooking(id) {
    if (!confirm('Ta bort den här bokningen?')) return;

    try {
        const response = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showMessage('Bokningen är borttagen.', '#1d7a46');
            fetchBookings();
        } else {
            showMessage('Kunde inte ta bort bokningen.', '#9b2331');
        }
    } catch (err) {
        console.error(err);
        showMessage('Kunde inte nå servern.', '#9b2331');
    }
}

async function loadRooms() {
    const select = document.getElementById('roomId');
    try {
        const response = await fetch('/api/rooms');
        if (!response.ok) throw new Error('rooms');
        const rooms = await response.json();

        select.replaceChildren();
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Välj rum';
        select.appendChild(placeholder);

        rooms.forEach((room) => {
            roomsById[room.id] = room.name;
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error(err);
        select.replaceChildren();
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Kunde inte hämta rum';
        select.appendChild(option);
    }
}

function formatTime(value) {
    return new Date(value).toLocaleString('sv-SE', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

async function fetchBookings() {
    list.replaceChildren();

    try {
        const response = await fetch('/api/bookings');
        if (!response.ok) throw new Error('bookings');
        const bookings = await response.json();
        bookings.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        if (bookings.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'empty';
            empty.textContent = 'Inga bokningar ännu.';
            list.appendChild(empty);
            return;
        }

        bookings.forEach((booking) => {
            const item = document.createElement('li');
            item.className = 'booking';

            const info = document.createElement('div');
            const title = document.createElement('h3');
            title.textContent = roomsById[booking.roomId] || `Rum ${booking.roomId}`;
            const meta = document.createElement('p');
            meta.textContent = `${booking.customerName} · ${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`;
            info.append(title, meta);

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Ta bort';
            deleteBtn.onclick = () => deleteBooking(booking.id);

            item.append(info, deleteBtn);
            list.appendChild(item);
        });
    } catch (err) {
        console.error(err);
        const empty = document.createElement('li');
        empty.className = 'empty';
        empty.textContent = 'Kunde inte hämta bokningarna.';
        list.appendChild(empty);
    }
}

loadRooms().then(fetchBookings);
