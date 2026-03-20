'use client';

import { useMemo, useState } from 'react';

const LIKERT_OPTIONS = [
  'Totalmente de acuerdo',
  'De acuerdo',
  'Ni de acuerdo ni en desacuerdo',
  'En desacuerdo',
  'Totalmente en desacuerdo',
];

const STRENGTH_OPTIONS = [
  'Fue claro en la definición de los procesos de trabajo',
  'Se alineó y ajustó al cronograma propuesto inicialmente',
  'Dio espacios a momentos de construcción y estrategia',
  'Identificó oportunidades para mejorar las experiencias',
  'Tiene un buen nivel de análisis y llega a conclusiones prácticas con impacto en el servicio',
  'Realizó implementaciones de calidad y ejecutó correctamente las acciones propuestas en el plan',
];

const ROLE_OPTIONS = [
  'Gerente/jefe de Marketing',
  'Coordinador',
  'Brand manager',
  'Otro',
];

const SERVICE_OPTIONS = [
  'Medios',
  'Planning',
  'Consultoría',
  'Creatividad',
  'BTL (Organización de eventos, logística)',
  'Otro',
];

const AGENCY_OPTIONS = [
  'ROGER',
  'OMD',
  'PHD',
  'LUPE',
  'NASTA',
  'BRICK',
  'BPR',
  'AMPLIFY',
];

type FormData = {
  evaluationYear: string;
  evaluationQuarter: string;
  agencyEvaluated: string;
  agencyEvaluator: string;
  email: string;

  q1_teamEnjoyWorking: string;
  q2_teamReliable: string;
  q3_collaboration: string;
  q4_valueCreation: string;
  q5_strategyBased: string;
  q6_creativeMindset: string;

  strengths: string[];

  recommendationScore: string;
  continuityScore: string;

  npsReason: string;
  comments: string;

  respondentName: string;
  respondentRole: string;
  respondentRoleOther: string;
  organization: string;
  serviceLine: string;
  serviceLineOther: string;
};

const initialState: FormData = {
  evaluationYear: '',
  evaluationQuarter: '',
  agencyEvaluated: '',
  agencyEvaluator: '',
  email: '',

  q1_teamEnjoyWorking: '',
  q2_teamReliable: '',
  q3_collaboration: '',
  q4_valueCreation: '',
  q5_strategyBased: '',
  q6_creativeMindset: '',

  strengths: [],

  recommendationScore: '',
  continuityScore: '',

  npsReason: '',
  comments: '',

  respondentName: '',
  respondentRole: '',
  respondentRoleOther: '',
  organization: '',
  serviceLine: '',
  serviceLineOther: '',
};

export default function EncuestaPage() {
  const [form, setForm] = useState<FormData>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isValid = useMemo(() => {
    return (
      form.evaluationYear &&
      form.evaluationQuarter &&
      form.agencyEvaluated &&
      form.agencyEvaluator &&
      form.email &&
      form.q1_teamEnjoyWorking &&
      form.q2_teamReliable &&
      form.q3_collaboration &&
      form.q4_valueCreation &&
      form.q5_strategyBased &&
      form.q6_creativeMindset &&
      form.recommendationScore !== '' &&
      form.continuityScore !== '' &&
      form.npsReason &&
      form.comments &&
      form.respondentName &&
      form.respondentRole &&
      form.organization &&
      form.serviceLine
    );
  }, [form]);

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleStrength(option: string) {
    setForm((prev) => {
      const exists = prev.strengths.includes(option);
      return {
        ...prev,
        strengths: exists
          ? prev.strengths.filter((item) => item !== option)
          : [...prev.strengths, option],
      };
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!isValid) {
      setErrorMessage('Completá todos los campos obligatorios.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...form,
        respondentRoleFinal:
          form.respondentRole === 'Otro'
            ? form.respondentRoleOther
            : form.respondentRole,
        serviceLineFinal:
          form.serviceLine === 'Otro'
            ? form.serviceLineOther
            : form.serviceLine,
      };

      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('No se pudo enviar la encuesta');
      }

      setSuccessMessage('Encuesta enviada correctamente.');
      setForm(initialState);
    } catch (error) {
      setErrorMessage('Hubo un problema al enviar la encuesta.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h1>Encuesta de satisfacción</h1>
      <p>
        Queremos conocer tu experiencia de trabajo con la agencia durante el período evaluado.
      </p>

      <form onSubmit={handleSubmit}>
        <section>
          <h2>1. Datos del relevamiento</h2>

          <label>Año evaluado *</label>
          <input
            type="number"
            value={form.evaluationYear}
            onChange={(e) => updateField('evaluationYear', e.target.value)}
          />

          <label>Quarter evaluado *</label>
          <select
            value={form.evaluationQuarter}
            onChange={(e) => updateField('evaluationQuarter', e.target.value)}
          >
            <option value="">Seleccionar</option>
            <option value="Q1">Q1 (Ene-Mar)</option>
            <option value="Q2">Q2 (Abr-Jun)</option>
            <option value="Q3">Q3 (Jul-Sep)</option>
            <option value="Q4">Q4 (Oct-Dic)</option>
          </select>

          <label>Agencia evaluada *</label>
          <select
            value={form.agencyEvaluated}
            onChange={(e) => updateField('agencyEvaluated', e.target.value)}
          >
            <option value="">Seleccionar</option>
            {AGENCY_OPTIONS.map((agency) => (
              <option key={agency} value={agency}>
                {agency}
              </option>
            ))}
          </select>

          <label>Agencia del encuestador *</label>
          <select
            value={form.agencyEvaluator}
            onChange={(e) => updateField('agencyEvaluator', e.target.value)}
          >
            <option value="">Seleccionar</option>
            {AGENCY_OPTIONS.map((agency) => (
              <option key={agency} value={agency}>
                {agency}
              </option>
            ))}
          </select>

          <label>Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </section>

        <section>
          <h2>2. Evaluación general</h2>

          <LikertQuestion
            label="Nuestro equipo disfrutó trabajando con la agencia *"
            value={form.q1_teamEnjoyWorking}
            onChange={(value) => updateField('q1_teamEnjoyWorking', value)}
          />

          <LikertQuestion
            label="El equipo de la agencia con el que trabajamos era fiable *"
            value={form.q2_teamReliable}
            onChange={(value) => updateField('q2_teamReliable', value)}
          />

          <LikertQuestion
            label="La agencia fomentó un ambiente colaborativo *"
            value={form.q3_collaboration}
            onChange={(value) => updateField('q3_collaboration', value)}
          />

          <LikertQuestion
            label="La agencia creó valor para nuestro equipo y permitió mejores prácticas para cumplir los objetivos del brief *"
            value={form.q4_valueCreation}
            onChange={(value) => updateField('q4_valueCreation', value)}
          />

          <LikertQuestion
            label="El trabajo de la agencia se basó en la estrategia *"
            value={form.q5_strategyBased}
            onChange={(value) => updateField('q5_strategyBased', value)}
          />

          <LikertQuestion
            label="La agencia nos permitió adoptar una mentalidad creativa *"
            value={form.q6_creativeMindset}
            onChange={(value) => updateField('q6_creativeMindset', value)}
          />
        </section>

        <section>
          <h2>3. Fortalezas percibidas</h2>
          <p>Seleccioná todas las opciones que correspondan.</p>
          {STRENGTH_OPTIONS.map((option) => (
            <label key={option} style={{ display: 'block', marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={form.strengths.includes(option)}
                onChange={() => toggleStrength(option)}
              />{' '}
              {option}
            </label>
          ))}
        </section>

        <section>
          <h2>4. NPS y continuidad</h2>

          <ScoreQuestion
            label="¿Qué probabilidad hay de que recomiendes a la agencia a un amigo o colega? *"
            value={form.recommendationScore}
            onChange={(value) => updateField('recommendationScore', value)}
          />

          <ScoreQuestion
            label="¿Qué probabilidad hay de que continúes contratando los servicios de la agencia? *"
            value={form.continuityScore}
            onChange={(value) => updateField('continuityScore', value)}
          />
        </section>

        <section>
          <h2>5. Comentarios</h2>

          <label>¿Por qué escogiste la puntuación anterior? *</label>
          <textarea
            rows={5}
            value={form.npsReason}
            onChange={(e) => updateField('npsReason', e.target.value)}
          />

          <label>Comentarios adicionales sobre tu experiencia *</label>
          <textarea
            rows={5}
            value={form.comments}
            onChange={(e) => updateField('comments', e.target.value)}
          />
        </section>

        <section>
          <h2>6. Datos del cliente</h2>

          <label>Nombre y apellido *</label>
          <input
            type="text"
            value={form.respondentName}
            onChange={(e) => updateField('respondentName', e.target.value)}
          />

          <label>Cargo *</label>
          <select
            value={form.respondentRole}
            onChange={(e) => updateField('respondentRole', e.target.value)}
          >
            <option value="">Seleccionar</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          {form.respondentRole === 'Otro' && (
            <>
              <label>Especificá el cargo *</label>
              <input
                type="text"
                value={form.respondentRoleOther}
                onChange={(e) => updateField('respondentRoleOther', e.target.value)}
              />
            </>
          )}

          <label>Organización a la que pertenecés *</label>
          <input
            type="text"
            value={form.organization}
            onChange={(e) => updateField('organization', e.target.value)}
          />

          <label>Servicio contratado *</label>
          <select
            value={form.serviceLine}
            onChange={(e) => updateField('serviceLine', e.target.value)}
          >
            <option value="">Seleccionar</option>
            {SERVICE_OPTIONS.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>

          {form.serviceLine === 'Otro' && (
            <>
              <label>Especificá el servicio *</label>
              <input
                type="text"
                value={form.serviceLineOther}
                onChange={(e) => updateField('serviceLineOther', e.target.value)}
              />
            </>
          )}
        </section>

        <div style={{ marginTop: 24 }}>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Enviar encuesta'}
          </button>
        </div>

        {successMessage && <p>{successMessage}</p>}
        {errorMessage && <p>{errorMessage}</p>}
      </form>
    </main>
  );
}

function LikertQuestion({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p>{label}</p>
      {LIKERT_OPTIONS.map((option) => (
        <label key={option} style={{ display: 'block', marginBottom: 6 }}>
          <input
            type="radio"
            name={label}
            value={option}
            checked={value === option}
            onChange={(e) => onChange(e.target.value)}
          />{' '}
          {option}
        </label>
      ))}
    </div>
  );
}

function ScoreQuestion({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {Array.from({ length: 11 }, (_, i) => String(i)).map((score) => (
          <label key={score}>
            <input
              type="radio"
              name={label}
              value={score}
              checked={value === score}
              onChange={(e) => onChange(e.target.value)}
            />{' '}
            {score}
          </label>
        ))}
      </div>
    </div>
  );
}
