import { useEffect, useState } from "react";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {



  CircleCheckBig,



  Clock3,

  CreditCard,

  GripVertical,



  Pencil,



  Plus,

  PiggyBank,

  TrendingUp,



  Trash2,



} from "lucide-react";



import { BrandGlyph } from "./BrandGlyph";



import {



  capitalize,



  formatDate,



  monthLabel,



  parseMonth,



} from "../utils/date";



import { money } from "../utils/finance";







export function Kpi({ label, value, icon: Icon, tone = "" }) {



  return (



    <article className={`kpi ${tone}`}>



      <div className="kpi-icon">



        <Icon size={19} />



      </div>



      <span>{label}</span>



      <strong>{money.format(value || 0)}</strong>



    </article>



  );



}







export function Panel({ title, subtitle, action, children }) {



  return (



    <article className="panel">



      <div className="panel-header">



        <div>



          <h3>{title}</h3>



          <p>{subtitle}</p>



        </div>



        {action}



      </div>



      {children}



    </article>



  );



}







export function Metric({ label, value, warning, moneyValue }) {



  const normalized = moneyValue



    ? 0



    : Math.max(0, Math.min(value || 0, 1.2));







  return (



    <div className="metric">



      <div>



        <span>{label}</span>



        <strong>



          {moneyValue



            ? money.format(value || 0)



            : `${Math.round((value || 0) * 100)}%`}



        </strong>



      </div>







      {!moneyValue && (



        <div className="progress-track">



          <div



            className={



              warning && value > 0.6



                ? "progress-fill warning"



                : "progress-fill"



            }



            style={{



              width: `${Math.min(normalized * 100, 100)}%`,



            }}



          />



        </div>



      )}



    </div>



  );



}







export function ListPage({



  title,



  subtitle,



  button,



  icon: Icon,



  onAdd,



  children,



}) {



  return (



    <div className="content">



      <section className="page-heading">



        <div>



          <h1>{title}</h1>



          <p>{subtitle}</p>



        </div>







        <button



          className="primary-button"



          onClick={onAdd}



        >



          <Plus size={18} /> {button}



        </button>



      </section>







      <section className="data-card">



        <div className="data-card-icon">



          <Icon size={20} />



        </div>



        {children}



      </section>



    </div>



  );



}







export function EmptyState({



  title = "Nada por aqui ainda",



  text,



  action,



  onClick,



}) {



  return (



    <div className="empty-state empty-state-rich">



      <div className="empty-icon">



        <BrandGlyph size={24} />



      </div>







      <strong>{title}</strong>



      <p>{text}</p>







      {action && (



        <button



          type="button"



          className="ghost-button"



          onClick={onClick}



        >



          {action}



        </button>



      )}



    </div>



  );



}







function incomeStatusLabel(status) {



  if (status === "Pendente") return "A receber";



  return status || "";



}







function expenseStatusLabel(status) {



  if (status === "Pendente") return "A pagar";



  if (status === "Pago") return "Pago";



  return status || "";



}







function totalAmount(items) {



  return items.reduce(



    (total, item) => total + Number(item.amount || 0),



    0



  );



}







function byDateAscending(a, b) {



  return String(a.date || "").localeCompare(String(b.date || ""));



}







function byDateDescending(a, b) {



  return String(b.date || "").localeCompare(String(a.date || ""));



}







function countLabel(count, singular, plural) {



  return `${count} ${count === 1 ? singular : plural}`;



}

const INCOME_ORDER_STEP = 1_000_000_000;

function stableIncomeHash(value) {
  const source = String(value || "");
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }

  return hash % 1_000_000;
}

function incomeFallbackOrder(item) {
  const baseDate = String(
    item?.recurrenceStartDate ||
    item?.date ||
    ""
  );

  const parsedDay = Number(baseDate.slice(8, 10));
  const day =
    Number.isInteger(parsedDay) &&
    parsedDay >= 1 &&
    parsedDay <= 31
      ? parsedDay
      : 31;

  const directionBase =
    item?.status === "Recebida"
      ? 32 - day
      : day;

  return (
    directionBase * INCOME_ORDER_STEP +
    stableIncomeHash(item?.id || item?.source)
  );
}

function incomeOrderValue(item) {
  const explicitOrder = Number(item?.sortOrder);

  return Number.isFinite(explicitOrder)
    ? explicitOrder
    : incomeFallbackOrder(item);
}

function byIncomeOrder(a, b) {
  const difference =
    incomeOrderValue(a) - incomeOrderValue(b);

  if (Math.abs(difference) > Number.EPSILON) {
    return difference;
  }

  const dateDifference = byDateAscending(a, b);

  if (dateDifference) return dateDifference;

  return String(a.id || "").localeCompare(
    String(b.id || "")
  );
}

function sortOrderBetween(previousItem, nextItem) {
  const previousOrder = previousItem
    ? incomeOrderValue(previousItem)
    : null;

  const nextOrder = nextItem
    ? incomeOrderValue(nextItem)
    : null;

  if (previousOrder === null && nextOrder === null) {
    return INCOME_ORDER_STEP;
  }

  if (previousOrder === null) {
    return nextOrder - INCOME_ORDER_STEP;
  }

  if (nextOrder === null) {
    return previousOrder + INCOME_ORDER_STEP;
  }

  return previousOrder + (nextOrder - previousOrder) / 2;
}


const MANUAL_ORDER_STEP = 1_000_000_000;

function manualFallbackOrderMap(items) {
  return new Map(
    items.map((item, index) => [
      item.id,
      (index + 1) * MANUAL_ORDER_STEP,
    ])
  );
}

function manualOrderValue(item, fallbackMap) {
  const explicitOrder = Number(item?.sortOrder);

  if (Number.isFinite(explicitOrder)) {
    return explicitOrder;
  }

  return (
    fallbackMap.get(item?.id) ??
    (fallbackMap.size + 1) * MANUAL_ORDER_STEP
  );
}

function applyManualOrder(fallbackItems) {
  const fallbackMap = manualFallbackOrderMap(fallbackItems);

  return [...fallbackItems].sort((a, b) => {
    const difference =
      manualOrderValue(a, fallbackMap) -
      manualOrderValue(b, fallbackMap);

    if (Math.abs(difference) > Number.EPSILON) {
      return difference;
    }

    return (
      (fallbackMap.get(a.id) || 0) -
      (fallbackMap.get(b.id) || 0)
    );
  });
}

function manualSortOrderBetween(
  previousItem,
  nextItem,
  fallbackItems
) {
  const fallbackMap = manualFallbackOrderMap(fallbackItems);
  const previousOrder = previousItem
    ? manualOrderValue(previousItem, fallbackMap)
    : null;
  const nextOrder = nextItem
    ? manualOrderValue(nextItem, fallbackMap)
    : null;

  if (previousOrder === null && nextOrder === null) {
    return MANUAL_ORDER_STEP;
  }

  if (previousOrder === null) {
    return nextOrder - MANUAL_ORDER_STEP;
  }

  if (nextOrder === null) {
    return previousOrder + MANUAL_ORDER_STEP;
  }

  return previousOrder + (nextOrder - previousOrder) / 2;
}

function SortableFinanceItem({
  item,
  reorderBusyId,
  renderItem,
}) {
  const reorderDisabled = Boolean(reorderBusyId);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: reorderDisabled,
  });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: isDragging ? "relative" : undefined,
    zIndex: isDragging ? 30 : undefined,
  };

  return renderItem({
    item,
    dragHandleProps: {
      ...attributes,
      ...listeners,
    },
    dragDisabled: reorderDisabled,
    sortableRef: setNodeRef,
    sortableStyle,
    dragging: isDragging,
  });
}

function SortableFinanceList({
  items,
  fallbackItems,
  onReorder,
  reorderBusyId,
  className = "records finance-sortable-list",
  renderItem,
}) {
  const [orderedItems, setOrderedItems] = useState(items);

  const externalOrderKey = items
    .map(
      (item) =>
        `${item.id}:${item.sortOrder ?? "auto"}:${item.status ?? ""}:${item.isPaid ?? ""}:${item.type ?? ""}:${item.date || item.firstDue || ""}`
    )
    .join("|");

  useEffect(() => {
    setOrderedItems(items);
  }, [externalOrderKey]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id || reorderBusyId) {
      return;
    }

    const oldIndex = orderedItems.findIndex(
      (item) => item.id === active.id
    );
    const newIndex = orderedItems.findIndex(
      (item) => item.id === over.id
    );

    if (oldIndex < 0 || newIndex < 0) return;

    const nextItems = arrayMove(
      orderedItems,
      oldIndex,
      newIndex
    );

    setOrderedItems(nextItems);

    const movedIndex = nextItems.findIndex(
      (item) => item.id === active.id
    );
    const movedItem = nextItems[movedIndex];
    const previousItem =
      movedIndex > 0 ? nextItems[movedIndex - 1] : null;
    const nextItem =
      movedIndex < nextItems.length - 1
        ? nextItems[movedIndex + 1]
        : null;

    const nextSortOrder = manualSortOrderBetween(
      previousItem,
      nextItem,
      fallbackItems
    );

    const saved = onReorder
      ? await onReorder(movedItem, nextSortOrder)
      : false;

    if (saved === false) {
      setOrderedItems(items);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={orderedItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={className}>
          {orderedItems.map((item) => (
            <SortableFinanceItem
              key={item.id}
              item={item}
              reorderBusyId={reorderBusyId}
              renderItem={renderItem}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}








function IncomeRecord({
  item,
  onEdit,
  onDelete,
  onMarkReceived,
  receiptBusyId,
  dragHandleProps,
  dragDisabled,
  sortableRef,
  sortableStyle,
  dragging,
}) {
  const description = item.description?.trim();
  const isPending = item.status === "Pendente";
  const title =
    item.source ||
    item.description ||
    "Renda";

  const subtitle = [
    formatDate(item.date),
    item.type || "Renda",
    description,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Record
      key={item.id}
      title={title}
      subtitle={subtitle}
      value={Number(item.amount || 0)}
      positive
      badge={incomeStatusLabel(item.status)}
      badgeTone={isPending ? "receivable" : "received"}
      recordTone={isPending ? "income-pending" : "income-received"}
      quickActionLabel={
        isPending
          ? receiptBusyId === item.id
            ? "Salvando..."
            : "Marcar como recebida"
          : ""
      }
      quickActionBusy={receiptBusyId === item.id}
      quickActionClassName="income-receive-button"
      onQuickAction={
        isPending && onMarkReceived
          ? () => onMarkReceived(item)
          : undefined
      }
      dragHandleProps={dragHandleProps}
      dragHandleLabel={`Reordenar ${title}`}
      dragHandleDisabled={dragDisabled}
      sortableRef={sortableRef}
      sortableStyle={sortableStyle}
      dragging={dragging}
      onEdit={() => onEdit(item)}
      onDelete={() => onDelete(item)}
    />
  );
}

function SortableIncomeRecord({
  item,
  onEdit,
  onDelete,
  onMarkReceived,
  receiptBusyId,
  reorderBusyId,
}) {
  const reorderDisabled = Boolean(reorderBusyId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: reorderDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: isDragging ? "relative" : undefined,
    zIndex: isDragging ? 30 : undefined,
  };

  return (
    <IncomeRecord
      item={item}
      onEdit={onEdit}
      onDelete={onDelete}
      onMarkReceived={onMarkReceived}
      receiptBusyId={receiptBusyId}
      dragDisabled={reorderDisabled}
      dragHandleProps={{
        ...attributes,
        ...listeners,
      }}
      sortableRef={setNodeRef}
      sortableStyle={style}
      dragging={isDragging}
    />
  );
}

function SortableIncomeList({
  items,
  onEdit,
  onDelete,
  onMarkReceived,
  receiptBusyId,
  onReorder,
  reorderBusyId,
}) {
  const [orderedItems, setOrderedItems] = useState(items);

  const externalOrderKey = items
    .map(
      (item) =>
        `${item.id}:${item.sortOrder ?? "auto"}:${item.status}:${item.recurrenceStartDate || item.date || ""}`
    )
    .join("|");

  useEffect(() => {
    setOrderedItems(items);
  }, [externalOrderKey]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id || reorderBusyId) {
      return;
    }

    const oldIndex = orderedItems.findIndex(
      (item) => item.id === active.id
    );

    const newIndex = orderedItems.findIndex(
      (item) => item.id === over.id
    );

    if (oldIndex < 0 || newIndex < 0) return;

    const nextItems = arrayMove(
      orderedItems,
      oldIndex,
      newIndex
    );

    setOrderedItems(nextItems);

    const movedIndex = nextItems.findIndex(
      (item) => item.id === active.id
    );

    const movedItem = nextItems[movedIndex];
    const previousItem =
      movedIndex > 0
        ? nextItems[movedIndex - 1]
        : null;
    const nextItem =
      movedIndex < nextItems.length - 1
        ? nextItems[movedIndex + 1]
        : null;

    const nextSortOrder = sortOrderBetween(
      previousItem,
      nextItem
    );

    const saved = onReorder
      ? await onReorder(movedItem, nextSortOrder)
      : false;

    if (saved === false) {
      setOrderedItems(items);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={orderedItems.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="records income-sortable-list">
          {orderedItems.map((item) => (
            <SortableIncomeRecord
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkReceived={onMarkReceived}
              receiptBusyId={receiptBusyId}
              reorderBusyId={reorderBusyId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function IncomeSection({
  title,
  subtitle,
  total,
  items,
  icon: Icon,
  emptyText,
  tone,
  onEdit,
  onDelete,
  onMarkReceived,
  receiptBusyId,
  onReorder,
  reorderBusyId,
}) {
  const stateClass = items.length
    ? "has-items"
    : "is-empty";

  return (
    <section
      className={`income-section income-section--${tone} ${stateClass}`}
    >
      <div className="income-section-header">
        <div>
          <div className="income-section-title">
            <span className="income-section-icon">
              <Icon size={17} />
            </span>
            <strong>{title}</strong>
          </div>

          <span className="income-section-subtitle">
            {subtitle}
          </span>
        </div>

        <strong className="income-section-total">
          {money.format(total)}
        </strong>
      </div>

      {items.length ? (
        <SortableIncomeList
          items={items}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkReceived={onMarkReceived}
          receiptBusyId={receiptBusyId}
          onReorder={onReorder}
          reorderBusyId={reorderBusyId}
        />
      ) : (
        <div className="income-empty-note">
          {emptyText}
        </div>
      )}
    </section>
  );
}

export function IncomeList({

  items,

  onEdit,

  onDelete,

  onAdd,

  onMarkReceived,

  receiptBusyId,

  onReorder,

  reorderBusyId,

}) {

  if (!items.length) {

    return (

      <EmptyState

        title="Comece pela sua primeira renda"

        text="Adicione salário, estágio, freelance ou qualquer entrada deste mês."

        action="Adicionar renda"

        onClick={onAdd}

      />

    );

  }



  const pending = items

    .filter((item) => item.status === "Pendente")

    .sort(byIncomeOrder);



  const received = items

    .filter((item) => item.status !== "Pendente")

    .sort(byIncomeOrder);



  const pendingTotal = totalAmount(pending);

  const receivedTotal = totalAmount(received);



  return (

    <div className="income-overview">

      <div className="income-summary-grid">

        <article className="income-summary-card income-summary-card--received">

          <div className="income-summary-icon">

            <CircleCheckBig size={19} />

          </div>



          <span className="income-summary-label">

            Recebido neste mês

          </span>



          <strong className="income-summary-value">

            {money.format(receivedTotal)}

          </strong>



          <small>

            {received.length

              ? `${countLabel(

                  received.length,

                  "renda recebida",

                  "rendas recebidas"

                )}`

              : "Nenhuma renda recebida"}

          </small>

        </article>



        <article

          className={`income-summary-card income-summary-card--pending ${

            pending.length ? "has-pending" : "is-clear"

          }`}

        >

          <div className="income-summary-icon">

            <Clock3 size={19} />

          </div>



          <span className="income-summary-label">

            Ainda a receber

          </span>



          <strong className="income-summary-value">

            {money.format(pendingTotal)}

          </strong>



          <small>

            {pending.length

              ? `${countLabel(

                  pending.length,

                  "entrada pendente",

                  "entradas pendentes"

                )}`

              : "Nada pendente"}

          </small>

        </article>

      </div>



      <IncomeSection

        title="A receber"

        subtitle={

          pending.length

            ? `${countLabel(

                pending.length,

                "renda",

                "rendas"

              )} ainda por receber`

            : "Tudo recebido neste mês"

        }

        total={pendingTotal}

        items={pending}

        icon={Clock3}

        tone="pending"

        emptyText="Nenhuma renda pendente neste mês."

        onEdit={onEdit}

        onDelete={onDelete}

        onMarkReceived={onMarkReceived}

        receiptBusyId={receiptBusyId}
        onReorder={onReorder}
        reorderBusyId={reorderBusyId}

      />



      <IncomeSection

        title="Já recebidas"

        subtitle={

          received.length

            ? `${countLabel(

                received.length,

                "renda recebida",

                "rendas recebidas"

              )} neste mês`

            : "Nenhuma renda recebida ainda"

        }

        total={receivedTotal}

        items={received}

        icon={CircleCheckBig}

        tone="received"

        emptyText="Nenhuma renda marcada como recebida neste mês."

        onEdit={onEdit}

        onDelete={onDelete}

        onMarkReceived={onMarkReceived}

        receiptBusyId={receiptBusyId}
        onReorder={onReorder}
        reorderBusyId={reorderBusyId}

      />

    </div>

  );

}







function installmentMonthlyTotal(items) {

  return items.reduce(

    (total, item) => total + Number(item.monthly || 0),

    0

  );

}



function InstallmentRecord({
  item,
  selectedMonth,
  onEdit,
  onDelete,
  onTogglePaid,
  dragHandleProps,
  dragDisabled,
  sortableRef,
  sortableStyle,
  dragging,
}) {
  const count = Math.max(Number(item.installments || 0), 0);
  const paidCount = Math.min(
    Number(item.paidMonths?.length || 0),
    count
  );
  const remaining = Math.max(count - paidCount, 0);
  const progress =
    count > 0 ? Math.min((paidCount / count) * 100, 100) : 0;

  const monthName = capitalize(
    monthLabel.format(parseMonth(selectedMonth))
  );
  const title = item.name || "Compra parcelada";

  return (
    <div
      ref={sortableRef}
      style={sortableStyle}
      className={`installment-card ${
        item.isPaid
          ? "installment-card--paid"
          : "installment-card--pending"
      } ${dragging ? "is-dragging" : ""}`}
    >
      <div className="installment-card-main">
        <div className="installment-card-title-row">
          <div>
            <div className="installment-card-heading">
              {dragHandleProps && (
                <button
                  type="button"
                  className="record-drag-handle"
                  aria-label={`Reordenar ${title}`}
                  title="Segure e arraste para reordenar"
                  disabled={dragDisabled}
                  {...dragHandleProps}
                >
                  <GripVertical size={16} />
                </button>
              )}
              <strong>{title}</strong>
            </div>

            <div className="record-meta">
              <span>
                {item.category || "Sem categoria"} · parcela{" "}
                {item.installmentNumber || 1}/{count} em {monthName}
              </span>

              <span
                className={`status-badge ${
                  item.isPaid
                    ? "status-badge--paid"
                    : "status-badge--pending"
                }`}
              >
                {item.isPaid ? "PAGA" : "A PAGAR"}
              </span>
            </div>
          </div>

          <div className="installment-card-value">
            <strong>{money.format(item.monthly || 0)}</strong>
            <span>/ mês</span>
          </div>
        </div>

        <div className="installment-progress">
          <div className="installment-progress-copy">
            <span>
              {paidCount} de {count} pagas
            </span>
            <strong>
              {remaining > 0
                ? `${remaining} ${remaining === 1 ? "parcela restante" : "parcelas restantes"}`
                : "Compra concluída"}
            </strong>
          </div>

          <div
            className="installment-progress-track"
            aria-label={`${Math.round(progress)}% das parcelas pagas`}
          >
            <div
              className="installment-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="record-actions installment-card-actions">
        <button
          type="button"
          className={
            item.isPaid
              ? "small-button installment-toggle-button is-paid"
              : "small-button installment-toggle-button"
          }
          onClick={() => onTogglePaid(item)}
        >
          {item.isPaid ? "✓ Paga" : "Marcar como paga"}
        </button>

        <button
          type="button"
          className="icon-button edit"
          onClick={() => onEdit(item)}
          title="Editar"
          aria-label={`Editar ${item.name}`}
        >
          <Pencil size={17} />
        </button>

        <button
          type="button"
          className="icon-button danger"
          onClick={() => onDelete(item)}
          title="Excluir"
          aria-label={`Excluir ${item.name}`}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}


function InstallmentSection({
  title,
  subtitle,
  total,
  items,
  fallbackItems,
  icon: Icon,
  tone,
  selectedMonth,
  onEdit,
  onDelete,
  onTogglePaid,
  onReorder,
  reorderBusyId,
}) {
  return (
    <section
      className={`installment-section installment-section--${tone} ${
        items.length ? "has-items" : "is-empty"
      }`}
    >
      <div className="installment-section-header">
        <div>
          <div className="installment-section-title">
            <span className="installment-section-icon">
              <Icon size={17} />
            </span>
            <strong>{title}</strong>
          </div>

          <span className="installment-section-subtitle">
            {subtitle}
          </span>
        </div>

        <strong className="installment-section-total">
          {money.format(total)}
        </strong>
      </div>

      {items.length ? (
        <SortableFinanceList
          items={items}
          fallbackItems={fallbackItems}
          onReorder={onReorder}
          reorderBusyId={reorderBusyId}
          className="installment-list finance-sortable-list"
          renderItem={({
            item,
            dragHandleProps,
            dragDisabled,
            sortableRef,
            sortableStyle,
            dragging,
          }) => (
            <InstallmentRecord
              item={item}
              selectedMonth={selectedMonth}
              onEdit={onEdit}
              onDelete={onDelete}
              onTogglePaid={onTogglePaid}
              dragHandleProps={dragHandleProps}
              dragDisabled={dragDisabled}
              sortableRef={sortableRef}
              sortableStyle={sortableStyle}
              dragging={dragging}
            />
          )}
        />
      ) : (
        <div className="installment-empty-note">
          {tone === "pending"
            ? "Nenhuma parcela pendente neste mês."
            : "Nenhuma parcela marcada como paga neste mês."}
        </div>
      )}
    </section>
  );
}


export function InstallmentList({

  items,

  selectedMonth,

  onEdit,

  onDelete,

  onTogglePaid,

  onAdd,

  onReorder,

  reorderBusyId,

}) {

  if (!items.length) {

    return (

      <EmptyState

        title="Nenhuma parcela neste mês"

        text="Cadastre uma compra parcelada uma única vez e acompanhe mês a mês."

        action="Adicionar compra"

        onClick={onAdd}

      />

    );

  }



  const pendingFallback = items.filter((item) => !item.isPaid);

  const paidFallback = items.filter((item) => item.isPaid);

  const pending = applyManualOrder(pendingFallback);

  const paid = applyManualOrder(paidFallback);



  const monthTotal = installmentMonthlyTotal(items);

  const pendingTotal = installmentMonthlyTotal(pending);

  const paidTotal = installmentMonthlyTotal(paid);



  return (

    <div className="installment-overview">

      <div className="installment-summary-grid">

        <article className="installment-summary-card installment-summary-card--total">

          <div className="installment-summary-icon">

            <CreditCard size={19} />

          </div>



          <span className="installment-summary-label">

            Parcelas deste mês

          </span>



          <strong className="installment-summary-value">

            {money.format(monthTotal)}

          </strong>



          <small>

            {countLabel(

              items.length,

              "parcela ativa",

              "parcelas ativas"

            )}

          </small>

        </article>



        <article className="installment-summary-card installment-summary-card--paid">

          <div className="installment-summary-icon">

            <CircleCheckBig size={19} />

          </div>



          <span className="installment-summary-label">

            Já pago

          </span>



          <strong className="installment-summary-value">

            {money.format(paidTotal)}

          </strong>



          <small>

            {paid.length

              ? countLabel(

                  paid.length,

                  "parcela paga",

                  "parcelas pagas"

                )

              : "Nenhuma paga ainda"}

          </small>

        </article>



        <article

          className={`installment-summary-card installment-summary-card--pending ${

            pending.length ? "has-pending" : "is-clear"

          }`}

        >

          <div className="installment-summary-icon">

            <Clock3 size={19} />

          </div>



          <span className="installment-summary-label">

            Ainda a pagar

          </span>



          <strong className="installment-summary-value">

            {money.format(pendingTotal)}

          </strong>



          <small>

            {pending.length

              ? countLabel(

                  pending.length,

                  "parcela pendente",

                  "parcelas pendentes"

                )

              : "Tudo pago neste mês"}

          </small>

        </article>

      </div>



      <InstallmentSection

        title="Pendentes"

        subtitle={

          pending.length

            ? `${countLabel(

                pending.length,

                "parcela",

                "parcelas"

              )} ainda por pagar`

            : "Tudo pago neste mês"

        }

        total={pendingTotal}

        items={pending}

        fallbackItems={pendingFallback}

        icon={Clock3}

        tone="pending"

        selectedMonth={selectedMonth}

        onEdit={onEdit}

        onDelete={onDelete}

        onTogglePaid={onTogglePaid}

        onReorder={onReorder}

        reorderBusyId={reorderBusyId}

      />



      <InstallmentSection

        title="Já pagas"

        subtitle={

          paid.length

            ? `${countLabel(

                paid.length,

                "parcela concluída",

                "parcelas concluídas"

              )} neste mês`

            : "Nenhuma parcela paga ainda"

        }

        total={paidTotal}

        items={paid}

        fallbackItems={paidFallback}

        icon={CircleCheckBig}

        tone="paid"

        selectedMonth={selectedMonth}

        onEdit={onEdit}

        onDelete={onDelete}

        onTogglePaid={onTogglePaid}

        onReorder={onReorder}

        reorderBusyId={reorderBusyId}

      />

    </div>

  );

}







function ExpenseRecord({

  item,

  onEdit,

  onDelete,

  onMarkPaid,

  paymentBusyId,

  dragHandleProps,

  dragDisabled,

  sortableRef,

  sortableStyle,

  dragging,

}) {

  const description = item.description?.trim();

  const isPending = item.status === "Pendente";



  const subtitle = [

    formatDate(item.date),

    description,

  ]

    .filter(Boolean)

    .join(" · ");



  return (

    <Record

      key={item.id}

      title={

        item.category ||

        item.description ||

        "Gasto"

      }

      subtitle={subtitle}

      value={Number(item.amount || 0)}

      badge={expenseStatusLabel(item.status)}

      badgeTone={isPending ? "pending" : "paid"}

      recordTone={isPending ? "pending" : "paid"}

      quickActionLabel={

        isPending

          ? paymentBusyId === item.id

            ? "Salvando..."

            : "Marcar como pago"

          : ""

      }

      quickActionBusy={paymentBusyId === item.id}

      onQuickAction={

        isPending && onMarkPaid

          ? () => onMarkPaid(item)

          : undefined

      }

      dragHandleProps={dragHandleProps}

      dragHandleLabel={`Reordenar ${item.category || item.description || "gasto"}`}

      dragHandleDisabled={dragDisabled}

      sortableRef={sortableRef}

      sortableStyle={sortableStyle}

      dragging={dragging}

      onEdit={() => onEdit(item)}

      onDelete={() => onDelete(item)}

    />

  );

}



function ExpenseSection({
  title,
  subtitle,
  total,
  items,
  fallbackItems,
  icon: Icon,
  emptyText,
  tone,
  onEdit,
  onDelete,
  onMarkPaid,
  paymentBusyId,
  onReorder,
  reorderBusyId,
}) {
  const stateClass = items.length
    ? "has-items"
    : "is-empty";

  return (
    <section
      className={`expense-section expense-section--${tone} ${stateClass}`}
    >
      <div className="expense-section-header">
        <div>
          <div className="expense-section-title">
            <span className="expense-section-icon">
              <Icon size={17} />
            </span>
            <strong>{title}</strong>
          </div>

          <span className="expense-section-subtitle">
            {subtitle}
          </span>
        </div>

        <strong className="expense-section-total">
          {money.format(total)}
        </strong>
      </div>

      {items.length ? (
        <SortableFinanceList
          items={items}
          fallbackItems={fallbackItems}
          onReorder={onReorder}
          reorderBusyId={reorderBusyId}
          renderItem={({
            item,
            dragHandleProps,
            dragDisabled,
            sortableRef,
            sortableStyle,
            dragging,
          }) => (
            <ExpenseRecord
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkPaid={onMarkPaid}
              paymentBusyId={paymentBusyId}
              dragHandleProps={dragHandleProps}
              dragDisabled={dragDisabled}
              sortableRef={sortableRef}
              sortableStyle={sortableStyle}
              dragging={dragging}
            />
          )}
        />
      ) : (
        <div className="expense-empty-note">
          {emptyText}
        </div>
      )}
    </section>
  );
}


function ExpenseList({

  items,

  onEdit,

  onDelete,

  onAdd,

  onMarkPaid,

  paymentBusyId,

  onReorder,

  reorderBusyId,

}) {

  if (!items.length) {

    return (

      <EmptyState

        title="Nenhum gasto avulso"

        text="Registre aqui os gastos que não fazem parte de compras parceladas."

        action="Adicionar gasto"

        onClick={onAdd}

      />

    );

  }



  const pendingFallback = items

    .filter((item) => item.status === "Pendente")

    .sort(byDateAscending);



  const paidFallback = items

    .filter((item) => item.status !== "Pendente")

    .sort(byDateDescending);



  const pending = applyManualOrder(pendingFallback);

  const paid = applyManualOrder(paidFallback);



  const pendingTotal = totalAmount(pending);

  const paidTotal = totalAmount(paid);



  return (

    <div className="expense-overview">

      <div className="expense-summary-grid">

        <article className="expense-summary-card expense-summary-card--paid">

          <div className="expense-summary-icon">

            <CircleCheckBig size={19} />

          </div>



          <span className="expense-summary-label">

            Já gasto neste mês

          </span>



          <strong className="expense-summary-value">

            {money.format(paidTotal)}

          </strong>



          <small>

            {paid.length

              ? `${countLabel(

                  paid.length,

                  "gasto concluído",

                  "gastos concluídos"

                )}`

              : "Nenhum gasto pago"}

          </small>

        </article>



        <article

          className={`expense-summary-card expense-summary-card--pending ${

            pending.length ? "has-pending" : "is-clear"

          }`}

        >

          <div className="expense-summary-icon">

            <Clock3 size={19} />

          </div>



          <span className="expense-summary-label">

            Ainda a pagar

          </span>



          <strong className="expense-summary-value">

            {money.format(pendingTotal)}

          </strong>



          <small>

            {pending.length

              ? `${countLabel(

                  pending.length,

                  "pendência",

                  "pendências"

                )} no mês`

              : "Nenhuma pendência"}

          </small>

        </article>

      </div>



      <ExpenseSection

        title="Pendências"

        subtitle={

          pending.length

            ? `${countLabel(

                pending.length,

                "gasto",

                "gastos"

              )} ainda por pagar`

            : "Tudo pago neste mês"

        }

        total={pendingTotal}

        items={pending}

        fallbackItems={pendingFallback}

        icon={Clock3}

        tone="pending"

        emptyText="Nenhum gasto pendente neste mês."

        onEdit={onEdit}

        onDelete={onDelete}

        onMarkPaid={onMarkPaid}

        paymentBusyId={paymentBusyId}

        onReorder={onReorder}

        reorderBusyId={reorderBusyId}

      />



      <ExpenseSection

        title="Já pagos"

        subtitle={

          paid.length

            ? `${countLabel(

                paid.length,

                "gasto concluído",

                "gastos concluídos"

              )} neste mês`

            : "Nenhum gasto pago ainda"

        }

        total={paidTotal}

        items={paid}

        fallbackItems={paidFallback}

        icon={CircleCheckBig}

        tone="paid"

        emptyText="Nenhum gasto marcado como pago neste mês."

        onEdit={onEdit}

        onDelete={onDelete}

        onMarkPaid={onMarkPaid}

        paymentBusyId={paymentBusyId}

        onReorder={onReorder}

        reorderBusyId={reorderBusyId}

      />

    </div>

  );

}



function AllocationRecord({

  item,

  onEdit,

  onDelete,

  dragHandleProps,

  dragDisabled,

  sortableRef,

  sortableStyle,

  dragging,

}) {

  const isInvestment = item.type === "Investimento";

  const description = item.destination?.trim();

  const legacyGoal = item.goal?.trim();



  const subtitle = [

    formatDate(item.date),

    legacyGoal,

  ]

    .filter(Boolean)

    .join(" · ");



  return (

    <Record

      key={item.id}

      title={

        description ||

        item.type ||

        "Aporte"

      }

      subtitle={subtitle}

      value={Number(item.amount || 0)}

      positive

      badge={isInvestment ? "INVESTIMENTO" : "RESERVA"}

      badgeTone={isInvestment ? "investment" : "reserve"}

      recordTone={

        isInvestment

          ? "allocation-investment"

          : "allocation-reserve"

      }

      dragHandleProps={dragHandleProps}

      dragHandleLabel={`Reordenar ${description || item.type || "aporte"}`}

      dragHandleDisabled={dragDisabled}

      sortableRef={sortableRef}

      sortableStyle={sortableStyle}

      dragging={dragging}

      onEdit={() => onEdit(item)}

      onDelete={() => onDelete(item)}

    />

  );

}



function AllocationSection({
  title,
  subtitle,
  total,
  items,
  fallbackItems,
  icon: Icon,
  tone,
  emptyText,
  onEdit,
  onDelete,
  onReorder,
  reorderBusyId,
}) {
  return (
    <section
      className={`allocation-section allocation-section--${tone} ${
        items.length ? "has-items" : "is-empty"
      }`}
    >
      <div className="allocation-section-header">
        <div>
          <div className="allocation-section-title">
            <span className="allocation-section-icon">
              <Icon size={17} />
            </span>
            <strong>{title}</strong>
          </div>

          <span className="allocation-section-subtitle">
            {subtitle}
          </span>
        </div>

        <strong className="allocation-section-total">
          {money.format(total)}
        </strong>
      </div>

      {items.length ? (
        <SortableFinanceList
          items={items}
          fallbackItems={fallbackItems}
          onReorder={onReorder}
          reorderBusyId={reorderBusyId}
          renderItem={({
            item,
            dragHandleProps,
            dragDisabled,
            sortableRef,
            sortableStyle,
            dragging,
          }) => (
            <AllocationRecord
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              dragHandleProps={dragHandleProps}
              dragDisabled={dragDisabled}
              sortableRef={sortableRef}
              sortableStyle={sortableStyle}
              dragging={dragging}
            />
          )}
        />
      ) : (
        <div className="allocation-empty-note">
          {emptyText}
        </div>
      )}
    </section>
  );
}


function AllocationList({

  items,

  onEdit,

  onDelete,

  onAdd,

  onReorder,

  reorderBusyId,

}) {

  if (!items.length) {

    return (

      <EmptyState

        title="Comece a guardar para o futuro"

        text="Registre uma reserva ou investimento para acompanhar sua evolução."

        action="Adicionar aporte"

        onClick={onAdd}

      />

    );

  }



  const reserveFallback = items

    .filter((item) => item.type === "Reserva")

    .sort(byDateDescending);



  const investmentFallback = items

    .filter((item) => item.type === "Investimento")

    .sort(byDateDescending);



  const reserves = applyManualOrder(reserveFallback);

  const investments = applyManualOrder(investmentFallback);



  const total = totalAmount(items);

  const reserveTotal = totalAmount(reserves);

  const investmentTotal = totalAmount(investments);



  return (

    <div className="allocation-overview">

      <div className="allocation-summary-grid">

        <article className="allocation-summary-card allocation-summary-card--total">

          <div className="allocation-summary-icon">

            <PiggyBank size={19} />

          </div>



          <span className="allocation-summary-label">

            Separado neste mês

          </span>



          <strong className="allocation-summary-value">

            {money.format(total)}

          </strong>



          <small>

            {countLabel(

              items.length,

              "aporte realizado",

              "aportes realizados"

            )}

          </small>

        </article>



        <article className="allocation-summary-card allocation-summary-card--reserve">

          <div className="allocation-summary-icon">

            <PiggyBank size={19} />

          </div>



          <span className="allocation-summary-label">

            Reservas

          </span>



          <strong className="allocation-summary-value">

            {money.format(reserveTotal)}

          </strong>



          <small>

            {reserves.length

              ? countLabel(

                  reserves.length,

                  "aporte em reserva",

                  "aportes em reserva"

                )

              : "Nenhuma reserva no mês"}

          </small>

        </article>



        <article className="allocation-summary-card allocation-summary-card--investment">

          <div className="allocation-summary-icon">

            <TrendingUp size={19} />

          </div>



          <span className="allocation-summary-label">

            Investimentos

          </span>



          <strong className="allocation-summary-value">

            {money.format(investmentTotal)}

          </strong>



          <small>

            {investments.length

              ? countLabel(

                  investments.length,

                  "aporte investido",

                  "aportes investidos"

                )

              : "Nenhum investimento no mês"}

          </small>

        </article>

      </div>



      <AllocationSection

        title="Reservas"

        subtitle={

          reserves.length

            ? `${countLabel(

                reserves.length,

                "aporte",

                "aportes"

              )} para sua reserva`

            : "Nenhuma reserva neste mês"

        }

        total={reserveTotal}

        items={reserves}

        fallbackItems={reserveFallback}

        icon={PiggyBank}

        tone="reserve"

        emptyText="Nenhum valor separado como reserva neste mês."

        onEdit={onEdit}

        onDelete={onDelete}

        onReorder={onReorder}

        reorderBusyId={reorderBusyId}

      />



      <AllocationSection

        title="Investimentos"

        subtitle={

          investments.length

            ? `${countLabel(

                investments.length,

                "aporte",

                "aportes"

              )} em investimentos`

            : "Nenhum investimento neste mês"

        }

        total={investmentTotal}

        items={investments}

        fallbackItems={investmentFallback}

        icon={TrendingUp}

        tone="investment"

        emptyText="Nenhum valor registrado como investimento neste mês."

        onEdit={onEdit}

        onDelete={onDelete}

        onReorder={onReorder}

        reorderBusyId={reorderBusyId}

      />

    </div>

  );

}



export function SimpleList({

  type,

  items,

  onEdit,

  onDelete,

  onAdd,

  onMarkPaid,

  paymentBusyId,

  onReorder,

  reorderBusyId,

}) {

  if (type === "gastos") {

    return (

      <ExpenseList

        items={items}

        onEdit={onEdit}

        onDelete={onDelete}

        onAdd={onAdd}

        onMarkPaid={onMarkPaid}

        paymentBusyId={paymentBusyId}

        onReorder={onReorder}

        reorderBusyId={reorderBusyId}

      />

    );

  }



  if (type === "aportes") {

    return (

      <AllocationList

        items={items}

        onEdit={onEdit}

        onDelete={onDelete}

        onAdd={onAdd}

        onReorder={onReorder}

        reorderBusyId={reorderBusyId}

      />

    );

  }



  return null;

}


export function Record({
  title,
  subtitle,
  value,
  positive,
  badge,
  badgeTone,
  recordTone,
  quickActionLabel,
  quickActionBusy,
  quickActionClassName = "expense-pay-button",
  onQuickAction,
  dragHandleProps,
  dragHandleLabel = "Reordenar",
  dragHandleDisabled = false,
  sortableRef,
  sortableStyle,
  dragging = false,
  onEdit,
  onDelete,
}) {
  const recordClassName = [
    "record",
    "finance-record",
    recordTone ? `record--${recordTone}` : "",
    dragging ? "is-dragging" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={sortableRef} style={sortableStyle} className={recordClassName}>
      <div className="finance-record-primary">
        <div className="record-main">
          <div className="record-title-row">
            {dragHandleProps && (
              <button
                type="button"
                className="record-drag-handle"
                aria-label={dragHandleLabel}
                title="Segure e arraste para reordenar"
                disabled={dragHandleDisabled}
                {...dragHandleProps}
              >
                <GripVertical size={16} />
              </button>
            )}

            <strong>{title}</strong>
          </div>

          <div className="record-meta">
            <span>{subtitle}</span>

            {badge && (
              <span
                className={`status-badge status-badge--${
                  badgeTone || "neutral"
                }`}
              >
                {badge}
              </span>
            )}
          </div>
        </div>

        <div
          className={
            positive
              ? "record-value positive"
              : "record-value"
          }
        >
          <strong>
            {positive ? "+" : "-"}{" "}
            {money.format(value)}
          </strong>
        </div>
      </div>

      <div className="record-actions finance-record-actions">
        {onQuickAction && (
          <button
            type="button"
            className={`small-button ${quickActionClassName}`}
            onClick={onQuickAction}
            disabled={quickActionBusy}
          >
            {quickActionLabel}
          </button>
        )}

        <button
          type="button"
          className="icon-button edit"
          onClick={onEdit}
          title="Editar"
          aria-label={`Editar ${title}`}
        >
          <Pencil size={17} />
        </button>

        <button
          type="button"
          className="icon-button danger"
          onClick={onDelete}
          title="Excluir"
          aria-label={`Excluir ${title}`}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}

