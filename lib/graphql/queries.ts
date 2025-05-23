import { gql } from "@apollo/client";

export const GET_PAGINATED_ALLOTMENTS = gql`
  query GetAllotments($limit: Int, $skip: Int) {
    allotments(limit: $limit, skip: $skip) {
      _id
      listCategory
      listSubCategory
      otherFields
    }
  }
`;
