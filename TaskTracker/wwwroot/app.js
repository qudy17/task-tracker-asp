const API_URL = '/api/todos';

async function loadTodos() {
    try {
        const res = await fetch(API_URL);
        const todos = await res.json();
        const list = document.getElementById('todoList');
        list.innerHTML = '';

        if (todos.length === 0) {
            list.innerHTML = '<li class="list-group-item text-muted text-center py-4">Список задач пуст!</li>';
            return;
        }

        const now = new Date();

        todos.forEach(todo => {
            const li = document.createElement('li');

            let isOverdue = false;
            let deadlineHtml = '';

            if (todo.dueDate) {
                const dueDate = new Date(todo.dueDate);
                const formattedDate = dueDate.toLocaleString('ru-RU', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                if (!todo.isCompleted && dueDate < now) {
                    isOverdue = true;
                    deadlineHtml = `<span class="badge bg-danger ms-2">⚠️ Просрочено: ${formattedDate}</span>`;
                } else {
                    deadlineHtml = `<span class="badge bg-secondary ms-2">⏰ Срок: ${formattedDate}</span>`;
                }
            }

            li.className = `list-group-item d-flex justify-content-between align-items-center py-3 ${isOverdue ? 'task-overdue' : ''}`;

            li.innerHTML = `
                <div>
                    <input class="form-check-input me-2" type="checkbox" ${todo.isCompleted ? 'checked' : ''} 
                        onchange="toggleTodo(${todo.id}, '${escapeHtml(todo.title)}', '${escapeHtml(todo.description || '')}', '${todo.dueDate || ''}', this.checked)">
                    <span class="${todo.isCompleted ? 'text-decoration-line-through text-muted' : 'fw-bold'}">${escapeHtml(todo.title)}</span>
                    ${deadlineHtml}
                    ${todo.description ? `<br><small class="text-secondary ms-4">${escapeHtml(todo.description)}</small>` : ''}
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTodo(${todo.id})">Удалить</button>
            `;
            list.appendChild(li);
        });
    } catch (err) {
        console.error('Ошибка загрузки задач:', err);
    }
}

document.getElementById('todoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const dueDateVal = document.getElementById('dueDate').value;

    const payload = {
        title: title,
        description: description,
        isCompleted: false,
        dueDate: dueDateVal ? dueDateVal : null
    };

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('dueDate').value = '';
    loadTodos();
});

async function toggleTodo(id, title, description, dueDate, isCompleted) {
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: title,
            description: description,
            dueDate: dueDate ? dueDate : null,
            isCompleted: isCompleted
        })
    });
    loadTodos();
}

async function deleteTodo(id) {
    if (confirm('Вы уверены, что хотите удалить задачу?')) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadTodos();
    }
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

loadTodos();