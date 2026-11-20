/**
 * Get the "Actions" portlet which varies across skins.
 *
 * @param skin
 * @returns
 */
export function findActionsPortlet(skin: string): JQuery<HTMLElement> | null {
  let list: JQuery<HTMLElement> | null;
  switch (skin) {
    case "vector-2022":
    case "vector":
      list = $("#p-cactions div.vector-menu-content ul.vector-menu-content-list");
      break;
    case "minerva":
      list = $("#page-actions #page-actions-overflow #p-tb");
      break;
    case "monobook":
    case "timeless":
    case "mirage":
      list = $("#p-cactions ul");
      $("#p-cactions").removeClass("emptyPortlet");
      break;
    case "medik":
      list = $("#p-actions ul");
      break;
    case "citizen":
      list = $("#p-cactions .citizen-menu__content .citizen-menu__content-list");
      break;
    default:
      list = null;
  }
  return list;
}

interface ActionLinkPortletItemProps {
  commonId: string;
  label: string;
  tooltip: string;
  onClick: (e: Event) => void;
}

/**
 * Skin-agnostic util to add a link to the "Actions" portlet.
 *
 * @param skin
 * @param $list
 * @returns
 */
export function addActionLinkToActionsPortlet(
  skin: string,
  $list: JQuery<HTMLElement>,
  { commonId, onClick, label, tooltip }: ActionLinkPortletItemProps,
): JQuery<HTMLElement> | null {
  if ($("#" + commonId).length > 0) {
    return null;
  }
  let tag = "<a>";
  if (["minerva", "citizen"].indexOf(skin) > -1) {
    tag = "<span>";
  }
  let $a = $(tag, {
    text: label,
    title: tooltip,
  })
    .data("source", false)
    .on("click", onClick);
  switch (skin) {
    case "vector-2022":
    case "vector":
    case "monobook":
    case "timeless":
    case "mirage":
    case "medik":
      $("<li>").attr("id", commonId).append($a).addClass("mw-list-item").appendTo($list);
      break;
    case "minerva":
      $a = $a.addClass("toggle-list-item__label");
      $("<li>")
        .attr("id", commonId)
        .append(
          $("<a>")
            .append($("<span>", { class: "mw-ui-icon mw-ui-icon-minerva-infoFilled" }))
            .addClass("toggle-list-item__anchor menu__item--page-actions-overflow-protect")
            .append($a),
        )
        .addClass("toggle-list-item")
        .appendTo($list);
      break;
    case "citizen":
      $("<li>")
        .attr("id", commonId)
        .append(
          $("<a>")
            .append(
              $("<span>", {
                class: "citizen-ui-icon mw-ui-icon-infoFilled mw-ui-icon-wikimedia-infoFilled",
              }),
            )
            .append($a),
        )
        .addClass("mw-list-item")
        .appendTo($list);
      break;
  }
  return $a;
}