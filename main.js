/* =================================================================
   DR PHONE — main.js
   Doctor en Línea: consulta médica interactiva para celulares
   ================================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Navbar scroll ----
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
    });

    // ---- Mobile menu ----
    const toggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    if (toggle && mobileMenu) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('open');
            mobileMenu.classList.toggle('open');
        });
        mobileMenu.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                toggle.classList.remove('open');
                mobileMenu.classList.remove('open');
            });
        });
    }

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            const el = document.querySelector(id);
            if (el) {
                e.preventDefault();
                const top = el.getBoundingClientRect().top + window.scrollY - 72;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ================================================================
    //  DOCTOR EN LÍNEA — Consulta médica interactiva
    // ================================================================

    const chatContainer = document.getElementById('doctorTimeline');
    if (!chatContainer) return;

    // State
    let patientData = {
        modelo: '',
        sintoma: '',
        sintomaKey: '',
        detalle: '',
        detalleKey: '',
        gravedad: ''
    };

    // ---- Diagnoses database ----
    const diagnoses = {
        pantalla_rota: {
            grietas: {
                titulo: 'Fractura de display con posible daño al digitalizador',
                gravedad: 'Media-Alta',
                explicacion: 'Las grietas en el vidrio no solo afectan lo estético. Con el tiempo, la humedad y el polvo se filtran por las fisuras y pueden dañar el digitalizador (la capa táctil) y los componentes internos. Cuanto antes se atienda, menor será el costo.',
                tratamiento: 'Reemplazo de módulo de pantalla completo (vidrio + LCD/OLED + táctil). Conservamos el True Tone original y restauramos el sellado de fábrica.',
                tiempo: '30 a 45 minutos',
                urgencia: 'Recomendamos atenderlo esta semana.'
            },
            lineas: {
                titulo: 'Daño en panel LCD/OLED — posible impacto interno',
                gravedad: 'Alta',
                explicacion: 'Las líneas de colores o manchas oscuras indican que el panel interno (LCD u OLED) sufrió un golpe que rompió los píxeles o dañó el conector flex. Esto suele empeorar progresivamente.',
                tratamiento: 'Reemplazo de pantalla OLED/LCD original. Se realiza prueba de Face ID y sensores post-instalación.',
                tiempo: '30 a 45 minutos',
                urgencia: 'Atención prioritaria, puede expandirse.'
            },
            tactil: {
                titulo: 'Falla del digitalizador — pérdida de respuesta táctil',
                gravedad: 'Alta',
                explicacion: 'Si la pantalla no responde al tacto o tiene "toques fantasma" (se toca sola), el digitalizador está comprometido. Esto puede deberse a un golpe, humedad, o una reparación previa con repuestos de baja calidad.',
                tratamiento: 'Reemplazo de módulo de pantalla con repuesto premium. Calibración de sensores y prueba de Touch completa.',
                tiempo: '45 minutos',
                urgencia: 'Tu equipo es difícil de usar así. Ven pronto.'
            }
        },
        bateria: {
            descarga: {
                titulo: 'Degradación avanzada de celda de batería',
                gravedad: 'Media',
                explicacion: 'Las baterías de litio tienen ciclos de vida útil. Cuando la salud baja del 80%, el sistema operativo reduce el rendimiento del procesador para proteger el equipo, lo que causa lentitud y apagones repentinos.',
                tratamiento: 'Reemplazo de batería certificada. Al finalizar, la salud aparecerá al 100% en Ajustes > Batería, sin alertas.',
                tiempo: '20 a 30 minutos',
                urgencia: 'Puedes programarlo esta semana.'
            },
            hinchada: {
                titulo: 'Batería con hinchamiento — riesgo de seguridad',
                gravedad: 'Crítica',
                explicacion: 'Una batería hinchada significa que los gases internos se están expandiendo. Esto puede deformar la pantalla, dañar la placa base e incluso representar un riesgo de incendio. No es algo para ignorar.',
                tratamiento: 'Extracción de emergencia de la batería dañada y reemplazo inmediato. Inspección de componentes adyacentes para verificar que no sufrieron daño.',
                tiempo: '30 minutos',
                urgencia: '⚠️ Urgente. Evita cargar el equipo hasta que lo revisemos.'
            },
            calentamiento: {
                titulo: 'Sobrecalentamiento por degradación de batería o placa',
                gravedad: 'Media-Alta',
                explicacion: 'El calentamiento excesivo puede originarse por una batería degradada que trabaja forzada, o por un componente de la placa base que está generando un cortocircuito menor. Necesitamos un diagnóstico presencial para determinarlo.',
                tratamiento: 'Diagnóstico térmico con cámara y medición de consumo en fuente regulada. Si es batería, reemplazo inmediato. Si es placa, microsoldadura del componente afectado.',
                tiempo: 'Diagnóstico: 15 min · Reparación: variable',
                urgencia: 'No lo dejes avanzar. Ven esta semana.'
            }
        },
        no_carga: {
            cable_no_entra: {
                titulo: 'Obstrucción del puerto de carga (Lightning/USB-C)',
                gravedad: 'Baja',
                explicacion: '¡Buenas noticias! En la mayoría de los casos esto NO es un daño. Se acumula pelusa, polvo y residuos en el puerto que impiden que el conector entre completamente. Es algo muy común y se resuelve sin cambiar piezas.',
                tratamiento: 'Limpieza profunda del puerto bajo lupa óptica con herramientas antiestáticas. Sin costo si la limpieza resuelve el problema.',
                tiempo: '10 minutos',
                urgencia: 'Puedes pasar cuando gustes. Es rápido.'
            },
            carga_intermitente: {
                titulo: 'Posible daño en flex de carga o pin del conector',
                gravedad: 'Media',
                explicacion: 'Si carga solo en cierta posición o se conecta y desconecta, el flex de carga (la pieza interna que conecta el puerto con la placa) puede tener un desgaste o fractura por uso. También podría ser el pin del conector que ya no hace buen contacto.',
                tratamiento: 'Revisión y posible reemplazo del flex de carga. Incluye prueba de micrófono inferior y altavoz (van conectados al mismo flex).',
                tiempo: '25 a 35 minutos',
                urgencia: 'No esperes a que deje de cargar por completo.'
            },
            no_responde: {
                titulo: 'Falla de circuito de carga en placa base',
                gravedad: 'Alta',
                explicacion: 'Si el equipo no reconoce ningún cable ni cargador, es posible que el circuito integrado de carga (IC Tristar/Hydra) se haya dañado. Esto suele ocurrir por uso de cargadores genéricos de mala calidad o fluctuaciones de corriente.',
                tratamiento: 'Microsoldadura del IC de carga en placa base. Requiere equipo de precisión y estación de calor controlada.',
                tiempo: '1 a 2 horas',
                urgencia: 'Requiere diagnóstico presencial.'
            }
        },
        mojado: {
            reciente: {
                titulo: 'Contacto con líquido reciente — intervención de emergencia',
                gravedad: 'Crítica',
                explicacion: 'Las primeras horas son clave. El agua conduce electricidad y puede estar generando cortocircuitos microscópicos en la placa ahora mismo. Por favor, NO intentes encenderlo, NO lo cargues y NO lo metas en arroz (el arroz NO funciona y puede dejar almidón que empeora la corrosión).',
                tratamiento: 'Apertura inmediata del equipo, desconexión de batería, limpieza ultrasónica con alcohol isopropílico de toda la placa base y conectores. Secado controlado y prueba de encendido.',
                tiempo: '1 a 3 horas (incluye secado)',
                urgencia: '🚨 Emergencia. Tráelo YA, apagado y sin cargar.'
            },
            hace_dias: {
                titulo: 'Daño por corrosión post-contacto con líquido',
                gravedad: 'Alta',
                explicacion: 'Después de varios días, los minerales del agua ya empezaron a oxidar los componentes y las soldaduras de la placa base. Es como una "infección" que se va expandiendo silenciosamente. Mientras más tiempo pase, más componentes se ven afectados.',
                tratamiento: 'Limpieza ultrasónica profunda + inspección bajo microscopio para identificar componentes corroídos. Posible microsoldadura de piezas dañadas. Recuperación de datos si es necesario.',
                tiempo: '2 a 4 horas',
                urgencia: 'Cada día que pasa, la corrosión avanza.'
            },
            funciona_raro: {
                titulo: 'Daño parcial por humedad — fallas intermitentes',
                gravedad: 'Media-Alta',
                explicacion: 'Cuando el equipo funciona "a medias" después de mojarse (ej. sin sonido, cámara empañada, botones que no responden), significa que el agua dañó componentes específicos pero no llegó a la placa principal. Hay muy buenas probabilidades de reparación total.',
                tratamiento: 'Apertura, limpieza preventiva de placa y reemplazo de los componentes afectados (altavoz, cámara, botones, micrófono, etc.).',
                tiempo: '1 a 2 horas',
                urgencia: 'No esperes. Los síntomas suelen empeorar.'
            }
        },
        no_enciende: {
            de_repente: {
                titulo: 'Apagón súbito — posible falla de alimentación',
                gravedad: 'Alta',
                explicacion: 'Cuando un iPhone se apaga de repente y no vuelve a encender, las causas más comunes son: batería completamente descargada o defectuosa, falla en el IC de alimentación, o un cortocircuito menor en placa. Necesitamos medir el consumo con una fuente regulada para saber exactamente qué ocurre.',
                tratamiento: 'Diagnóstico con fuente de poder regulada para medir consumo de corriente. Según resultado: reemplazo de batería, reparación de IC, o microsoldadura.',
                tiempo: 'Diagnóstico: 15 min · Reparación: variable',
                urgencia: 'Necesita revisión presencial.'
            },
            despues_golpe: {
                titulo: 'Daño por impacto — posible desconexión interna',
                gravedad: 'Alta',
                explicacion: 'Un golpe fuerte puede desconectar los flex internos (pantalla, batería) o fracturar soldaduras microscópicas en la placa base. A veces el equipo está "vivo" pero la pantalla está desconectada internamente, así que parece que no enciende pero sí está funcionando.',
                tratamiento: 'Apertura del equipo, reconexión de cables flex, inspección de placa bajo microscopio. Posible reemplazo de pantalla si el flex se dañó.',
                tiempo: '30 min a 1 hora',
                urgencia: 'Tráelo para descartemos lo peor.'
            },
            despues_agua: {
                titulo: 'No enciende tras contacto con líquido',
                gravedad: 'Crítica',
                explicacion: 'Esta es una de las situaciones más delicadas. El agua pudo haber dañado el circuito de alimentación o causado un cortocircuito en la placa. La prioridad es limpiar antes de intentar encender, ya que forzar el encendido puede empeorar el daño.',
                tratamiento: 'Limpieza ultrasónica de emergencia + diagnóstico completo de placa con microscopio. Recuperación de datos como prioridad si la placa no responde.',
                tiempo: '2 a 4 horas',
                urgencia: '🚨 Emergencia. NO intentes cargarlo.'
            }
        },
        camara: {
            borrosa: {
                titulo: 'Desenfoque de lente o daño en el módulo de cámara',
                gravedad: 'Media',
                explicacion: 'Si las fotos salen borrosas o el autofocus no funciona, puede ser que el estabilizador óptico (OIS) esté fallando, el lente se haya rayado, o que el módulo de cámara necesite reemplazo. En algunos casos, una limpieza del lente resuelve el problema.',
                tratamiento: 'Limpieza de lente + diagnóstico del módulo de cámara. Si el OIS o el sensor fallan, se reemplaza el módulo completo.',
                tiempo: '20 a 40 minutos',
                urgencia: 'Puedes programarlo sin prisa.'
            },
            empanada: {
                titulo: 'Condensación interna en módulo de cámara',
                gravedad: 'Media',
                explicacion: 'Cuando la cámara se ve "empañada por dentro", significa que humedad entró al módulo sellado de la cámara. Esto suele pasar por cambios bruscos de temperatura o por pérdida del sellado original (a veces por reparaciones previas).',
                tratamiento: 'Reemplazo del módulo de cámara y restauración del sellado. Limpieza preventiva de la zona para eliminar residuos de humedad.',
                tiempo: '30 minutos',
                urgencia: 'No es urgente pero no mejora solo.'
            },
            no_funciona: {
                titulo: 'Falla del sensor de cámara o del conector flex',
                gravedad: 'Media-Alta',
                explicacion: 'Si la app de cámara muestra pantalla negra, se cierra sola, o el flash no funciona, el problema puede estar en el sensor, en el cable flex, o incluso en un componente de la placa que alimenta la cámara.',
                tratamiento: 'Prueba con módulo de cámara conocido para aislar si es módulo o placa. Reemplazo de cámara o reparación de placa según resultado.',
                tiempo: '30 a 60 minutos',
                urgencia: 'Necesita revisión para determinar la causa.'
            }
        },
        otro: {
            general: {
                titulo: 'Falla no clasificada — requiere evaluación personalizada',
                gravedad: 'Por determinar',
                explicacion: 'Cada equipo es un caso único. Para fallas que no encajan en los síntomas comunes, necesitamos verlo en persona para hacer un diagnóstico certero con nuestras herramientas de precisión.',
                tratamiento: 'Diagnóstico completo presencial: revisión visual, prueba de componentes, medición de consumo y evaluación bajo microscopio.',
                tiempo: '15 a 30 minutos (diagnóstico)',
                urgencia: 'Agenda tu visita y lo revisamos juntos.'
            }
        }
    };

    // Sub-questions per symptom (the "doctor follow-up")
    const followUps = {
        pantalla_rota: {
            pregunta: 'Entiendo. Necesito saber un poco más. ¿Cómo se ve el daño en la pantalla?',
            opciones: [
                { key: 'grietas', label: 'Tiene grietas o el vidrio está estrellado' },
                { key: 'lineas', label: 'Se ven líneas de colores o manchas negras' },
                { key: 'tactil', label: 'No responde al tacto o se toca sola' }
            ]
        },
        bateria: {
            pregunta: 'Bien, vamos a revisar. ¿Cuál de estos síntomas describe mejor lo que le pasa?',
            opciones: [
                { key: 'descarga', label: 'Se descarga muy rápido o se apaga de repente' },
                { key: 'hinchada', label: 'La pantalla se está levantando o se ve hinchado' },
                { key: 'calentamiento', label: 'Se calienta demasiado al usarlo o cargarlo' }
            ]
        },
        no_carga: {
            pregunta: 'Revisemos. ¿Qué pasa exactamente cuando intentas cargarlo?',
            opciones: [
                { key: 'cable_no_entra', label: 'El cable no entra completo o queda flojo' },
                { key: 'carga_intermitente', label: 'Carga un rato y se desconecta solo' },
                { key: 'no_responde', label: 'No reconoce ningún cable ni cargador' }
            ]
        },
        mojado: {
            pregunta: 'Es importante que actúes rápido. ¿Cuándo pasó y cómo está ahora?',
            opciones: [
                { key: 'reciente', label: 'Pasó hoy o ayer y aún no lo he prendido' },
                { key: 'hace_dias', label: 'Fue hace varios días y funciona raro o no prende' },
                { key: 'funciona_raro', label: 'Funciona pero con fallas (sonido, cámara, etc.)' }
            ]
        },
        no_enciende: {
            pregunta: 'Vamos a investigar. ¿Recuerdas qué pasó antes de que dejara de encender?',
            opciones: [
                { key: 'de_repente', label: 'Se apagó solo y no volvió a prender' },
                { key: 'despues_golpe', label: 'Se cayó o recibió un golpe fuerte' },
                { key: 'despues_agua', label: 'Le cayó agua o se mojó' }
            ]
        },
        camara: {
            pregunta: 'Cuéntame un poco más. ¿Qué le pasa exactamente a la cámara?',
            opciones: [
                { key: 'borrosa', label: 'Las fotos salen borrosas o no enfoca' },
                { key: 'empanada', label: 'Se ve empañada por dentro del lente' },
                { key: 'no_funciona', label: 'La app de cámara no abre o muestra pantalla negra' }
            ]
        },
        otro: {
            pregunta: null,
            opciones: []
        }
    };

    // ---- Helper: create a DOM element ----
    function el(tag, cls, html) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (html) e.innerHTML = html;
        return e;
    }

    // ---- Progress & Room Status Management ----
    const roomStatus = document.getElementById('roomStatus');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = [
        document.getElementById('progressLine1'),
        document.getElementById('progressLine2'),
        document.getElementById('progressLine3')
    ];

    function setProgress(stepNumber) {
        progressSteps.forEach(s => {
            const n = parseInt(s.dataset.step);
            s.classList.remove('active', 'done');
            if (n < stepNumber) s.classList.add('done');
            else if (n === stepNumber) s.classList.add('active');
        });
        progressLines.forEach((line, i) => {
            if (line) {
                if (i < stepNumber - 1) line.classList.add('filled');
                else line.classList.remove('filled');
            }
        });
    }

    function setRoomStatus(text, mode) {
        if (!roomStatus) return;
        roomStatus.textContent = text;
        roomStatus.className = 'room-status';
        if (mode) roomStatus.classList.add(mode);
    }

    function resetRoom() {
        setProgress(1);
        setRoomStatus('En línea · Listo para tu consulta', '');
    }

    // ---- Helper: scroll chat into view ----
    function scrollToBottom() {
        setTimeout(() => {
            const last = chatContainer.lastElementChild;
            if (last) last.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    }

    // ---- Helper: typing delay ----
    function typeDelay(callback, ms = 600) {
        const dots = el('div', 'typing-indicator', '<span></span><span></span><span></span>');
        chatContainer.appendChild(dots);
        scrollToBottom();
        setTimeout(() => {
            dots.remove();
            callback();
        }, ms);
    }

    // ---- Render: Doctor bubble ----
    function addDoctorBubble(html) {
        const bubble = el('div', 'msg msg-doctor fadeUp', `
            <div class="msg-avatar">🩺</div>
            <div class="msg-body">
                <span class="msg-name">Dr. Phone</span>
                ${html}
            </div>
        `);
        chatContainer.appendChild(bubble);
        scrollToBottom();
    }

    // ---- Render: Patient bubble ----
    function addPatientBubble(text) {
        const bubble = el('div', 'msg msg-patient fadeUp', `
            <div class="msg-body">
                <span class="msg-name">Tú</span>
                <p>${text}</p>
            </div>
        `);
        chatContainer.appendChild(bubble);
        scrollToBottom();
    }

    // ---- Render: Options row ----
    function addOptions(options, callback) {
        const wrap = el('div', 'msg-options fadeUp');
        options.forEach(opt => {
            const btn = el('button', 'opt-btn', opt.label);
            btn.addEventListener('click', () => {
                // Disable all buttons
                wrap.querySelectorAll('button').forEach(b => { b.disabled = true; b.classList.add('disabled'); });
                btn.classList.add('selected');
                callback(opt);
            });
            wrap.appendChild(btn);
        });
        chatContainer.appendChild(wrap);
        scrollToBottom();
    }

    // ================================================================
    //  STEP 1: Greeting + Model Selection
    // ================================================================
    function startConsultation() {
        chatContainer.innerHTML = '';
        patientData = { modelo: '', sintoma: '', sintomaKey: '', detalle: '', detalleKey: '', gravedad: '' };
        resetRoom();

        typeDelay(() => {
            setRoomStatus('Esperando selección de modelo...', 'analyzing');
            addDoctorBubble(`
                <p>¡Hola! Soy el <strong>Dr. Phone</strong>, tu especialista en dispositivos Apple.</p>
                <p>Vamos a hacer una consulta rápida para entender qué le pasa a tu equipo y darte un diagnóstico preliminar.</p>
                <p>Para empezar, <strong>¿qué modelo tienes?</strong></p>
            `);

            const models = [
                { key: 'iPhone 11', label: 'iPhone 11' },
                { key: 'iPhone 12', label: 'iPhone 12' },
                { key: 'iPhone 13', label: 'iPhone 13' },
                { key: 'iPhone 14', label: 'iPhone 14' },
                { key: 'iPhone 15', label: 'iPhone 15' },
                { key: 'iPhone 16', label: 'iPhone 16' },
                { key: 'iPad', label: 'iPad' },
                { key: 'Otro', label: 'Otro modelo' },
            ];
            addOptions(models, (opt) => {
                patientData.modelo = opt.key;
                addPatientBubble(opt.label);
                setProgress(2);
                setTimeout(() => askSymptom(), 400);
            });
        }, 800);
    }

    // ================================================================
    //  STEP 2: Symptom Selection
    // ================================================================
    function askSymptom() {
        setRoomStatus('Evaluando síntomas...', 'analyzing');
        typeDelay(() => {
            addDoctorBubble(`
                <p>Perfecto, un <strong>${patientData.modelo}</strong>. Lo tengo anotado en tu ficha.</p>
                <p>Ahora cuéntame: <strong>¿qué síntomas presenta?</strong> Selecciona el que más se parezca a lo que le está pasando.</p>
            `);

            const symptoms = [
                { key: 'pantalla_rota', label: '📱 Pantalla rota, líneas o no responde al tacto' },
                { key: 'bateria', label: '🔋 Batería se descarga rápido, se apaga o se calienta' },
                { key: 'no_carga', label: '🔌 No carga o el cable no entra bien' },
                { key: 'mojado', label: '💧 Le cayó agua o líquido' },
                { key: 'no_enciende', label: '⚫ No enciende' },
                { key: 'camara', label: '📸 Cámara borrosa, empañada o no funciona' },
                { key: 'otro', label: '🔧 Otra falla diferente' },
            ];
            addOptions(symptoms, (opt) => {
                patientData.sintomaKey = opt.key;
                patientData.sintoma = opt.label;
                addPatientBubble(opt.label);
                setProgress(3);
                setTimeout(() => askFollowUp(), 400);
            });
        });
    }

    // ================================================================
    //  STEP 3: Follow-up question (the doctor digs deeper)
    // ================================================================
    function askFollowUp() {
        const fu = followUps[patientData.sintomaKey];

        // If "otro" or no follow-up, skip to diagnosis directly
        if (!fu || !fu.pregunta) {
            patientData.detalleKey = 'general';
            setProgress(4);
            showDiagnosis();
            return;
        }

        setRoomStatus('Profundizando en el diagnóstico...', 'analyzing');
        typeDelay(() => {
            addDoctorBubble(`<p>${fu.pregunta}</p>`);

            addOptions(fu.opciones.map(o => ({ key: o.key, label: o.label })), (opt) => {
                patientData.detalleKey = opt.key;
                patientData.detalle = opt.label;
                addPatientBubble(opt.label);
                setProgress(4);
                setTimeout(() => showDiagnosis(), 400);
            });
        });
    }

    // ================================================================
    //  STEP 4: Diagnosis reveal (the medical report)
    // ================================================================
    function showDiagnosis() {
        const dx = diagnoses[patientData.sintomaKey]?.[patientData.detalleKey];
        setRoomStatus('Generando diagnóstico...', 'diagnosing');
        if (!dx) {
            typeDelay(() => {
                setRoomStatus('Diagnóstico completado ✓', '');
                addDoctorBubble(`<p>Necesito ver tu equipo en persona para darte un diagnóstico certero. ¡Escríbenos por WhatsApp y agenda tu cita!</p>`);
                addCTA();
            });
            return;
        }

        typeDelay(() => {
            setRoomStatus('Diagnóstico completado ✓', '');
            // Gravedad color
            let gravedadClass = 'severity-low';
            if (dx.gravedad.includes('Crítica')) gravedadClass = 'severity-critical';
            else if (dx.gravedad.includes('Alta')) gravedadClass = 'severity-high';
            else if (dx.gravedad.includes('Media')) gravedadClass = 'severity-medium';

            addDoctorBubble(`
                <p>Listo, ya tengo un panorama claro. Aquí va mi <strong>diagnóstico preliminar</strong> para tu ${patientData.modelo}:</p>

                <div class="diagnosis-card">
                    <div class="dx-header">
                        <span class="dx-badge ${gravedadClass}">${dx.gravedad}</span>
                    </div>
                    <h4 class="dx-title">${dx.titulo}</h4>

                    <div class="dx-section">
                        <span class="dx-label">¿Qué está pasando?</span>
                        <p>${dx.explicacion}</p>
                    </div>

                    <div class="dx-section">
                        <span class="dx-label">Tratamiento recomendado</span>
                        <p>${dx.tratamiento}</p>
                    </div>

                    <div class="dx-row">
                        <div class="dx-section">
                            <span class="dx-label">Tiempo estimado</span>
                            <p>${dx.tiempo}</p>
                        </div>
                        <div class="dx-section">
                            <span class="dx-label">Recomendación</span>
                            <p>${dx.urgencia}</p>
                        </div>
                    </div>
                </div>

                <p style="margin-top:1rem;">Si quieres que revisemos tu equipo, escríbenos por WhatsApp con este diagnóstico y te atendemos de inmediato. 👇</p>
            `);

            addCTA();
        }, 1000);
    }

    // ---- CTA Buttons ----
    function addCTA() {
        const msg = `Hola Dr Phone, acabo de hacer el diagnóstico en línea.\n\nModelo: ${patientData.modelo}\nSíntoma: ${patientData.sintoma}\nDetalle: ${patientData.detalle || 'No especificado'}\n\nQuiero agendar mi reparación.`;
        const waURL = `https://wa.me/573505148495?text=${encodeURIComponent(msg)}`;

        const wrap = el('div', 'msg-actions fadeUp');
        wrap.innerHTML = `
            <a href="${waURL}" target="_blank" rel="noopener" class="btn-fill">Agendar reparación por WhatsApp</a>
            <button class="btn-ghost" id="restartBtn">Hacer otra consulta</button>
        `;
        chatContainer.appendChild(wrap);
        scrollToBottom();

        document.getElementById('restartBtn').addEventListener('click', startConsultation);
    }

    // ---- Init ----
    startConsultation();

});
