import { Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap';
import adminAvatar from '@/assets/img/avatar-admin.png';
import { authService } from '@/services/auth.service';

const ProfileDropdown = () => {
  const usuario = authService.getUsuario();

  const displayName  = usuario?.nombreUsuario ?? usuario?.usuarioId ?? 'Usuario';
  const displayEmail = usuario?.email ?? usuario?.usuarioId ?? '';

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handlePrint = () => window.print();

  const handleLogout = () => {
    authService.logout();
    window.location.replace('/auth/login');
  };

  return (
    <Dropdown>
      <DropdownToggle
        as="a"
        type="button"
        className="btn-system bg-transparent d-flex flex-shrink-0 align-items-center justify-content-center no-arrow"
        aria-label="Perfil"
      >
        <img src={adminAvatar} className="profile-image profile-image-md rounded-circle" alt={displayName} />
      </DropdownToggle>

      <DropdownMenu className="dropdown-menu-animated dropdown-menu-end">
        {/* Header usuario */}
        <div className="notification-header rounded-top mb-2">
          <div className="d-flex flex-row align-items-center mt-1 mb-1 color-white">
            <span className="status status-success d-inline-block me-2">
              <img src={adminAvatar} className="profile-image rounded-circle" alt={displayName} />
            </span>
            <div className="info-card-text">
              <div className="fs-lg text-truncate text-truncate-lg">{displayName}</div>
              <span className="text-truncate text-truncate-md opacity-80 fs-sm">{displayEmail}</span>
            </div>
          </div>
        </div>

        <DropdownDivider className="m-0" />

        <DropdownItem
          className="dropdown-item d-flex justify-content-between align-items-center"
          onClick={handleFullscreen}
        >
          <span>Pantalla completa</span>
          <b className="text-muted fs-nano px-2 rounded font-monospace align-self-center border">F11</b>
        </DropdownItem>

        <DropdownItem
          className="dropdown-item d-flex justify-content-between align-items-center"
          onClick={handlePrint}
        >
          <span>Imprimir</span>
          <span className="text-muted fs-nano px-2 rounded font-monospace align-self-center border">
            <svg width="15" height="15">
              <path
                d="M4.505 4.496h2M5.505 5.496v5M8.216 4.496l.055 5.993M10 7.5c.333.333.5.667.5 1v2M12.326 4.5v5.996M8.384 4.496c1.674 0 2.116 0 2.116 1.5s-.442 1.5-2.116 1.5M3.205 9.303c-.09.448-.277 1.21-1.241 1.203C1 10.5.5 9.513.5 8V7c0-1.57.5-2.5 1.464-2.494.964.006 1.134.598 1.24 1.342M12.553 10.5h1.953"
                strokeWidth="1.2" stroke="currentColor" fill="none" strokeLinecap="square"
              />
            </svg>{' '}+ P
          </span>
        </DropdownItem>

        <DropdownDivider className="m-0" />

        <DropdownItem
          className="py-3 fw-500 d-flex justify-content-between"
          onClick={handleLogout}
        >
          <span className="text-danger">Cerrar sesión</span>
          <span className="d-block text-truncate text-truncate-sm text-muted">
            {usuario?.usuarioId ?? ''}
          </span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
