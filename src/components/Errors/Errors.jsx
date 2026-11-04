import "./Errors.css";

const Errores = ({ mensaje }) => {
  if (!mensaje) return null;

  return (
    <div className="alert alert-danger" role="alert">
      {mensaje}
    </div>
  );
};

export default Errores;