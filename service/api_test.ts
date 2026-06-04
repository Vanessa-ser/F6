import API_URL from '../config/api';

export const saveNoteToCloud = async (note: any): Promise<any> => {
  try {
    console.log('Enviando nota a la nube:', note, 'API_URL=', API_URL);
    const response = await fetch(`${API_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al guardar nota en la nube:', error);
  }
};

export const saveChecklistToCloud = async (checklist: any): Promise<any> => {
  try {
    console.log('Enviando tarea a la nube:', checklist, 'API_URL=', API_URL);
    const response = await fetch(`${API_URL}/checklist-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checklist),
    });

    if (!response.ok) {
      throw new Error(`Error en el servidor: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al guardar tarea en la nube:', error);
  }
};