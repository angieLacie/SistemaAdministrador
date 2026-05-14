import { Card, CardBody } from 'react-bootstrap';
const ProjectStatisticWidget = ({
  item
}) => {
  const {
    variant,
    count,
    subtitle,
    change,
    title
  } = item;
  return <Card className="mb-g">
      <CardBody>
        <h6 className="text-muted text-uppercase mt-0">{title}</h6>
        <h2>{count}</h2>
        <div className="d-flex align-items-center gap-2">
          <span className={`badge bg-${variant}`}>{change} </span>
          <span className="text-muted">{subtitle}</span>
        </div>
      </CardBody>
    </Card>;
};
export default ProjectStatisticWidget;