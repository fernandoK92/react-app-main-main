const express = require('express');
const cors = require('cors');
const ibmdb = require('ibm_db');

const app = express(); // ← AQUÍ se crea app

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connStr = "DATABASE=BLUDB;HOSTNAME=localhost;PORT=50000;PROTOCOL=TCPIP;UID=db2inst1;PWD=Abcd1234";


// ============================
// TEST
// ============================

app.get('/', (req, res) => {
    res.send("Backend funcionando");
});


// ============================
// GET RESERVATIONS
// ============================

app.get('/reservations', (req, res) => {

    ibmdb.open(connStr, (err, conn) => {

        if (err) return res.status(500).json({ error: err.message });

        conn.query("SELECT * FROM reservations", (err, data) => {

            conn.close();

            if (err) return res.status(500).json({ error: err.message });

            res.json(data);

        });

    });

});


// ============================
// POST RESERVATIONS
// ============================

app.post('/reservations', (req, res) => {

    console.log("BODY:", req.body);

    const b = req.body;

    const sql = `
    INSERT INTO reservations (
        code,
        unique_code,
        is_urgent_request,
        room_id,
        date,
        start_time,
        end_time,
        setup_type,
        serves_snack,
        snack_time,
        snack_end_time,
        selected_equipment,
        course_name,
        requester_name,
        requester_email,
        created_by_user_id,
        department,
        attendees_count,
        location,
        company,
        general_objective,
        specific_objectives,
        skills,
        other_needs,
        observations,
        hiring_type,
        event_corresponds,
        optional_notes,
        confirmed,
        end_date
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const values = [
        b.code || null,
        b.unique_code || null,
        b.is_urgent_request ? 1 : 0,
        b.room_id,
        b.date,
        b.start_time,
        b.end_time,
        b.setup_type,
        b.serves_snack || null,
        b.snack_time || null,
        b.snack_end_time || null,
        Array.isArray(b.selected_equipment)
            ? b.selected_equipment.join(',')
            : b.selected_equipment || null,
        b.course_name,
        b.requester_name,
        b.requester_email,
        b.created_by_user_id || null,
        b.department || null,
        b.attendees_count || 0,
        b.location || null,
        b.company || null,
        b.general_objective || null,
        b.specific_objectives || null,
        b.skills || null,
        b.other_needs || null,
        b.observations || null,
        b.hiring_type || null,
        b.event_corresponds || null,
        b.optional_notes || null,
        b.confirmed ? 1 : 0,
        b.end_date || null
    ];


    ibmdb.open(connStr, (err, conn) => {
        if (err) return res.status(500).json({ error: err.message });
        conn.query(sql, values, (err, data) => {
            conn.close();
            if (err) {
                console.log("DB2 ERROR:", err);
                console.log("VALUES:", values);
                return res.status(500).json({
                    error: err.message,
                    values
                });
            }
            res.json({
                success: true,
                message: "Reserva creada correctamente"
            });
        });
    });

});


// ============================
// SERVIDOR
// ============================

app.listen(3001, () => {

    console.log("Servidor corriendo en http://localhost:3001");

});