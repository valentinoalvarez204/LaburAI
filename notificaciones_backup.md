# Backup: Sistema de Notificaciones LaburAI

Este archivo contiene los cambios realizados para que la campana de notificaciones funcione correctamente. Puedes copiarlos para integrarlos en tu rama limpia.

## 1. Backend: Disparador de Notificaciones
**Archivo:** `backend/src/applications/applications.service.ts`

```typescript
    if (data.estado) {
      const statusLabels = {
        PENDIENTE: 'en revisión',
        REVISADA: 'revisada',
        ENTREVISTA: 'seleccionada para entrevista',
        RECHAZADA: 'rechazada',
      };

      await this.notificationsService.create({
        usuarioId: updated.candidato.usuarioId,
        titulo: 'Actualización de postulación',
        mensaje: `Tu postulación para "${updated.oferta.titulo}" ha sido ${statusLabels[data.estado]}.`,
        tipo: data.estado === 'RECHAZADA' ? 'alert' : 'success',
        link: `/pages/dashboard-candidato.html?section=postulaciones&id=${updated.id}`,
      });
    }
```

## 2. Frontend: Métodos API
**Archivo:** `frontend/js/api.js`

```javascript
async function getNotifications() {
  try {
    return await apiFetch('/notifications');
  } catch (err) {
    console.error('[API] Error obteniendo notificaciones:', err.message);
    throw err;
  }
}

async function getNotificationsUnreadCount() {
  try {
    return await apiFetch('/notifications/unread-count');
  } catch (err) {
    console.error('[API] Error count notif:', err.message);
    throw err;
  }
}

async function patchNotificationRead(id) {
  try {
    return await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
  } catch (err) {
    console.error('[API] Error marking notif as read:', err.message);
    throw err;
  }
}

async function patchNotificationsReadAll() {
  try {
    return await apiFetch('/notifications/read-all', { method: 'PATCH' });
  } catch (err) {
    console.error('[API] Error marking all as read:', err.message);
    throw err;
  }
}
```

## 3. Frontend: Componente Navbar
**Archivo:** `frontend/js/utils.js` (Dentro de `renderNavbar()`)

```javascript
      <div class="topbar-notif-wrapper" style="position:relative">
        <button class="topbar-notif" id="btnNotif" aria-label="Notificaciones" style="margin-right:4px">
          ${getIcon('bell', 'icon-xs')}
          <span class="notif-dot" id="notifDot" style="display:none"></span>
        </button>
        <div class="notif-dropdown" id="notifDropdown">
          <div class="notif-header">
            <h4>Notificaciones</h4>
            <button class="notif-mark-all" id="btnNotifClearAll">Limpiar todo</button>
          </div>
          <div class="notif-list" id="notifList">
            <div class="notif-empty">Cargando...</div>
          </div>
          <div class="notif-footer">
            <a href="${dashboard}?section=postulaciones">Ver todas mis postulaciones</a>
          </div>
        </div>
      </div>
```
