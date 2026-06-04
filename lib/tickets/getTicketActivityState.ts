export function getTicketActivityState(

  lastActivityAt?: string,

  lastViewedAt?: string

) {

  /*
    NO ACTIVITY
  */

  if (!lastActivityAt) {

    return {

      updatedRecently:
        false,
    };
  }

  /*
    NEVER VIEWED
  */

  if (!lastViewedAt) {

    return {

      updatedRecently:
        true,
    };
  }

  /*
    UPDATED AFTER VIEW
  */

  const updatedRecently =

    new Date(
      lastActivityAt
    ).getTime()

    >

    new Date(
      lastViewedAt
    ).getTime();

  return {

    updatedRecently,
  };
}