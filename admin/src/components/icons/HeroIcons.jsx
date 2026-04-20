import PropTypes from 'prop-types';

/**
 * Lightweight local icon set based on Heroicons paths.
 * Keeping icons local avoids external runtime dependencies for admin navigation/actions.
 */
const IconBase = ({ className, children }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.8}
    stroke="currentColor"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

IconBase.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

IconBase.defaultProps = {
  className: 'icon-sm',
};

export const PlusCircleIcon = ({ className }) => (
  <IconBase className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </IconBase>
);

export const ClipboardDocumentListIcon = ({ className }) => (
  <IconBase className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 2.25h6A2.25 2.25 0 0 1 17.25 4.5v.75H18a2.25 2.25 0 0 1 2.25 2.25v11.25A2.25 2.25 0 0 1 18 21H6a2.25 2.25 0 0 1-2.25-2.25V7.5A2.25 2.25 0 0 1 6 5.25h.75V4.5A2.25 2.25 0 0 1 9 2.25Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6M9 12h6m-6 3h3" />
  </IconBase>
);

export const TruckIcon = ({ className }) => (
  <IconBase className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm10.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 18.75V6A2.25 2.25 0 0 1 6 3.75h7.5A2.25 2.25 0 0 1 15.75 6v12.75m-12 0H6m9.75 0h1.5A2.25 2.25 0 0 0 19.5 16.5v-3.75a1.5 1.5 0 0 0-.44-1.06l-1.81-1.81a1.5 1.5 0 0 0-1.06-.44h-.44" />
  </IconBase>
);

export const ArrowDownTrayIcon = ({ className }) => (
  <IconBase className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4M4.5 20.25h15" />
  </IconBase>
);

PlusCircleIcon.propTypes = { className: PropTypes.string };
ClipboardDocumentListIcon.propTypes = { className: PropTypes.string };
TruckIcon.propTypes = { className: PropTypes.string };
ArrowDownTrayIcon.propTypes = { className: PropTypes.string };

PlusCircleIcon.defaultProps = { className: 'icon-sm' };
ClipboardDocumentListIcon.defaultProps = { className: 'icon-sm' };
TruckIcon.defaultProps = { className: 'icon-sm' };
ArrowDownTrayIcon.defaultProps = { className: 'icon-sm' };
